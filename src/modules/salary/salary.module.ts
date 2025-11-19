import { Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryResolver } from './salary.resolver';

@Module({
  providers: [SalaryResolver, SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
