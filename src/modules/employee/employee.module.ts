import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';
import { SalaryModule } from '../salary/salary.module';
import { TitleModule } from '../title/title.module';
import { DepartmentModule } from '../department/department.module';
import { Employee, DeptEmp } from '../../typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, DeptEmp]),
    forwardRef(() => DepartmentModule),
    TitleModule,
    SalaryModule,
  ],
  providers: [EmployeeResolver, EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
