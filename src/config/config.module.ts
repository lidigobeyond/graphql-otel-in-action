import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.APP_ENV === 'prod',
    }),
  ],
})
export class AppConfigModule {}
