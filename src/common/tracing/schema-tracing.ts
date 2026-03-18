import { GraphQLResolveInfo, GraphQLSchema, isObjectType } from 'graphql';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * GraphQL 스키마의 모든 resolver에 OpenTelemetry 스팬을 추가한다.
 *
 * ## 배경
 * @opentelemetry/instrumentation-graphql 라이브러리는 GraphQL 실행 전체를 감싸는
 * graphql.parse / graphql.validate / graphql.execute 스팬을 제공하지만,
 * resolver 단위 스팬에는 버그가 있어 @Query / @Mutation / @ResolveField 스팬이 누락된다.
 * 이를 보완하기 위해 transformSchema 훅을 통해 resolver를 직접 패치한다.
 *
 * ## 스칼라 필드 처리
 * NestJS는 @Field() 스칼라 프로퍼티에도 field.resolve를 자동으로 설정한다.
 * 이 resolver들은 instrumentation-graphql의 ignoreTrivialResolveSpans가 작동하지 않아
 * 불필요한 스팬이 생성된다. (버그 원인: wrapFields가 isDefaultResolver=false로 래핑하기 때문)
 * 해결책으로, 스칼라 필드의 field.resolve를 undefined로 제거하면
 * instrumentation-graphql이 global fallback resolver(isDefaultResolver=true)를 사용하게 되어
 * ignoreTrivialResolveSpans가 정상 작동한다.
 */
export function wrapResolversWithTracing(schema: GraphQLSchema): GraphQLSchema {
  const tracer = trace.getTracer('hr-graphql-api');

  for (const type of Object.values(schema.getTypeMap())) {
    // 내부 타입(__typename 등)과 객체 타입이 아닌 것(스칼라, 열거형 등)은 건너뜀
    if (type.name.startsWith('__') || !isObjectType(type)) continue;

    for (const field of Object.values(type.getFields())) {
      if (!field.resolve) continue;

      // NestJS는 @Query/@ResolveField를 async function으로 래핑하지만,
      // 스칼라 @Field()의 property accessor는 동기 함수다.
      // async 여부로 NestJS resolver인지 구분한다.
      const isNestJSResolver = field.resolve.constructor?.name === 'AsyncFunction';

      if (!isNestJSResolver) {
        // 스칼라 필드: resolver 제거 → instrumentation-graphql이 trivial로 처리
        field.resolve = undefined;
        continue;
      }

      // @Query / @Mutation / @ResolveField: 커스텀 스팬으로 래핑
      const originalResolve = field.resolve;
      field.resolve = (source, args, context, info) => {
        const spanName = `graphql.resolve ${buildFieldPath(info.path)}`;
        return tracer.startActiveSpan(spanName, (span) => {
          setSpanAttributes(span, info, args);
          try {
            const result = originalResolve(source, args, context, info);
            if (result instanceof Promise) {
              return result.then((v) => { span.end(); return v; }).catch((err) => {
                span.recordException(err);
                span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
                span.end();
                throw err;
              });
            }
            span.end();
            return result;
          } catch (err) {
            span.recordException(err as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });
            span.end();
            throw err;
          }
        });
      };
    }
  }

  return schema;
}

// GraphQL 필드 경로(연결 리스트)를 "department.employees" 형태의 문자열로 변환
interface FieldPath {
  prev: FieldPath | undefined;
  key: string | number;
}

function buildFieldPath(path: FieldPath): string {
  const parts: (string | number)[] = [];
  let curr: FieldPath | undefined = path;
  while (curr) {
    parts.unshift(curr.key);
    curr = curr.prev;
  }
  return parts.join('.');
}

// instrumentation-graphql과 동일한 속성명으로 스팬에 GraphQL 메타데이터를 추가
function setSpanAttributes(span: Span, info: GraphQLResolveInfo, args: Record<string, unknown>) {
  span.setAttributes({
    'graphql.field.name': info.fieldName,
    'graphql.field.path': buildFieldPath(info.path),
    'graphql.field.type': info.returnType.toString(),
    'graphql.operation.type': info.operation.operation,
    'graphql.operation.name': info.operation.name?.value ?? '',
  });
  for (const [key, value] of Object.entries(args)) {
    span.setAttribute(`graphql.variables.${key}`, JSON.stringify(value));
  }
}
