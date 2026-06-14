/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';

const sdk = new NodeSDK({
  serviceName: 'hr-graphql-api',
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    headers: {},
  }),
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
        headers: {},
      }),
    }),
  ],
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new GraphQLInstrumentation({
      depth: -1,
      ignoreTrivialResolveSpans: true,
      allowValues: true,
    }),
    new MySQL2Instrumentation({
      maskStatement: true,
      maskStatementHook(sql) {
        return sql
          .replace(/\b\d+\b/g, '?') // 숫자 리터럴 마스킹 (기본 동작) 
          .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '?') // 문자열 리터럴 마스킹 (기본 동작)
          .replace(/IN\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, 'IN (?)'); // IN 절 정규화
      },
    }),
    new RuntimeNodeInstrumentation(),
  ],
});

sdk.start();
