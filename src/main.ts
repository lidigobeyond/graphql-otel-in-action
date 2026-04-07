/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { GcpLoggerService } from './common/logging/gcp-logger.service';

async function bootstrap() {
  const gcpLogger = new GcpLoggerService();
  // NestFactory에 logger 옵션으로 전달하면 부트스트랩 로그를 포함해
  // 모든 new Logger(context) 인스턴스가 gcpLogger에 위임된다.
  const app = await NestFactory.create(AppModule, { logger: gcpLogger });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

(async () => {
  await bootstrap();
})();
