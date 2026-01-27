import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentResolver } from './department.resolver';
import { DepartmentService } from './department.service';
import { EmployeeModule } from '../employee/employee.module';
import { Department, DeptEmp } from '../../typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, DeptEmp]),
    forwardRef(() => EmployeeModule),
  ],
  providers: [DepartmentResolver, DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
