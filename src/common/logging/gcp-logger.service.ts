import { ConsoleLogger, LoggerService } from '@nestjs/common';
import { isSpanContextValid, trace } from '@opentelemetry/api';

type GcpSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

const SEVERITY_MAP: Record<string, GcpSeverity> = {
  log: 'INFO',
  error: 'ERROR',
  warn: 'WARNING',
  debug: 'DEBUG',
  verbose: 'DEBUG',
  fatal: 'CRITICAL',
};

// 스택 프레임 필터링: 로거 내부 및 NestJS/Node 내부 프레임 제외
const EXCLUDE_PATTERNS = [
  /gcp-logger\.service/,
  /@nestjs\/common/,
  /node_modules\/@nestjs/,
  /node:/,
];

interface SourceLocation {
  file: string;
  line: string;
  function: string;
}

interface TraceContext {
  trace: string;
  spanId: string;
}

/**
 * Error 스택에서 실제 호출 위치(파일, 라인, 함수명)를 추출한다.
 * setImmediate 이전, 동기 컨텍스트에서 호출해야 올바른 프레임이 잡힌다.
 */
function extractSourceLocation(): SourceLocation | undefined {
  const frames = new Error().stack?.split('\n') ?? [];

  for (let i = 1; i < frames.length; i++) {
    const frame = frames[i];
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(frame))) continue;
    return parseStackFrame(frame);
  }
  return undefined;
}

function parseStackFrame(frame: string): SourceLocation | undefined {
  // "    at ClassName.method (/abs/path/file.ts:34:12)"
  const named = frame.match(/^\s+at\s+([\w.<>$]+)\s+\((.+):(\d+):\d+\)$/);
  if (named) {
    return { function: named[1], file: named[2], line: named[3] };
  }

  // "    at /abs/path/file.ts:34:12"  (익명 / 화살표 함수)
  const anon = frame.match(/^\s+at\s+(.+):(\d+):\d+$/);
  if (anon) {
    return { function: '<anonymous>', file: anon[1], line: anon[2] };
  }

  return undefined;
}

/**
 * OTel 활성 스팬에서 traceId / spanId를 추출한다.
 * 스팬이 없거나 INVALID_SPAN_CONTEXT(all-zero)이면 undefined를 반환한다.
 */
function extractTraceContext(): TraceContext | undefined {
  const span = trace.getActiveSpan();
  if (!span) return undefined;

  const ctx = span.spanContext();
  if (!isSpanContextValid(ctx)) return undefined;

  const gcpProjectId = process.env.GCP_PROJECT_ID;
  const traceValue = gcpProjectId
    ? `projects/${gcpProjectId}/traces/${ctx.traceId}`
    : ctx.traceId;

  return { trace: traceValue, spanId: ctx.spanId };
}

/**
 * NestJS Logger는 context를 optionalParams의 마지막 요소로 전달한다.
 */
function extractContext(optionalParams: any[]): string | undefined {
  if (optionalParams.length === 0) return undefined;
  const last = optionalParams[optionalParams.length - 1];
  return typeof last === 'string' ? last : undefined;
}

/**
 * message가 non-null 객체이면 필드를 최상위에 병합(GCP jsonPayload 동작),
 * 문자열이면 message 필드로 출력한다.
 */
function buildMessagePayload(message: any): Record<string, unknown> {
  if (message !== null && typeof message === 'object') {
    return { ...(message as Record<string, unknown>) };
  }
  return { message: String(message) };
}

/**
 * GCP Cloud Logging 형식의 구조화 로그를 출력하는 NestJS LoggerService.
 *
 * - APP_ENV=local / test → NestJS ConsoleLogger에 위임 (컬러 pretty 출력)
 * - 그 외 환경 → 단일 JSON 라인을 stdout에 비동기(setImmediate)로 출력
 *
 * main.ts에서 NestFactory.create(AppModule, { logger: new GcpLoggerService() })
 * 로 등록하면 모든 new Logger(context) 인스턴스가 이 로거에 위임된다.
 */
export class GcpLoggerService implements LoggerService {
  private readonly isStructured: boolean;
  private readonly fallback: ConsoleLogger;

  constructor() {
    const env = process.env.APP_ENV ?? 'local';
    this.isStructured = env !== 'local' && env !== 'test';
    this.fallback = new ConsoleLogger();
  }

  log(message: any, ...optionalParams: any[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]): void {
    this.write('fatal', message, optionalParams);
  }

  private write(level: string, message: any, optionalParams: any[]): void {
    if (!this.isStructured) {
      (this.fallback as any)[level]?.(message, ...optionalParams);
      return;
    }

    // 스택과 트레이스는 setImmediate 이전, 동기 컨텍스트에서 캡처해야 한다.
    const sourceLocation = extractSourceLocation();
    const traceCtx = extractTraceContext();
    const context = extractContext(optionalParams);

    setImmediate(() => {
      const entry: Record<string, unknown> = {
        ...buildMessagePayload(message),   // 객체 페이로드 먼저 (GCP 예약 필드에 덮어쓰임)
        severity: SEVERITY_MAP[level] ?? 'INFO',
        ...(context ? { context } : {}),
        ...(traceCtx
          ? {
              'logging.googleapis.com/trace': traceCtx.trace,
              'logging.googleapis.com/spanId': traceCtx.spanId,
            }
          : {}),
        ...(sourceLocation
          ? { 'logging.googleapis.com/sourceLocation': sourceLocation }
          : {}),
      };

      process.stdout.write(JSON.stringify(entry) + '\n');
    });
  }
}
