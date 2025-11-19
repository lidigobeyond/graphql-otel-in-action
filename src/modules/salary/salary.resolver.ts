import { Args, Query, Resolver } from '@nestjs/graphql';
import { SalaryService } from './salary.service';
import { SalaryLog } from './salary.dto';

@Resolver()
export class SalaryResolver {
  constructor(private readonly salaryService: SalaryService) {}
}
