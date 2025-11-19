import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from './graphql/grapql.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { SalaryModule } from './modules/salary/salary.module';
import { TitleModule } from './modules/title/title.module';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule,
    DepartmentModule,
    EmployeeModule,
    TitleModule,
    SalaryModule,
  ],
})
export class AppModule {}
