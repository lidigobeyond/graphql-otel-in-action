import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Employee,
  Department,
  DeptEmp,
  DeptManager,
  Salary,
  Title,
} from './entities';

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Employee, Department, DeptEmp, DeptManager, Salary, Title],
        synchronize: false,
        logging: ['query', 'error', 'warn', 'info'],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmConfigModule {}
