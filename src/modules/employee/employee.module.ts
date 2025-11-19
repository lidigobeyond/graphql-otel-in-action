import { forwardRef, Module } from '@nestjs/common';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';
import { SalaryModule } from '../salary/salary.module';
import { TitleModule } from '../title/title.module';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [forwardRef(() => DepartmentModule), TitleModule, SalaryModule],
  providers: [EmployeeResolver, EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
