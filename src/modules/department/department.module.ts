import { forwardRef, Module } from '@nestjs/common';
import { DepartmentResolver } from './department.resolver';
import { DepartmentService } from './department.service';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [forwardRef(() => EmployeeModule)],
  providers: [DepartmentResolver, DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
