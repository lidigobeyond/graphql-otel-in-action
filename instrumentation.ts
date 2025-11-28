/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://opentelemetry-collector.opentelemetry.svc.cluster.local:4318/v1/traces',
    headers: {},
  }),
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: 'http://opentelemetry-collector.opentelemetry.svc.cluster.local:4318/v1/metrics',
        headers: {},
      }),
    }),
  ],
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new GraphQLInstrumentation({
      // Operation span과 resolver span 모두 생성
      mergeItems: false,
      // Trivial resolver (id, name 등) 제외
      ignoreTrivialResolveSpans: true,
      // 값을 attribute에 포함하지 않음 (보안)
      allowValues: false,
      // 모든 depth 추적
      depth: -1,
      // 디버깅용: operation 정보 출력
      responseHook: (span, data) => {
        console.log(
          'GraphQL instrumentation data:',
          JSON.stringify(data, null, 2),
        );
      },
    }),
    new PrismaInstrumentation(),
  ],
});

sdk.start();
