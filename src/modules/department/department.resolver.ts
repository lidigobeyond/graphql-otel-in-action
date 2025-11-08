import { Department, DepartmentLog, Departments } from './department.dto';
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { DepartmentService } from './department.service';
import { Employee, EmployeeLogs, Employees } from '../employee/employee.dto';
import { EmployeeService } from '../employee/employee.service';

@Resolver(() => Department)
export class DepartmentResolver {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly employeeService: EmployeeService,
  ) {}

  @Query(() => Department, { name: 'department', nullable: true })
  getById(@Args('id') id: string): Promise<Department | null> {
    return this.departmentService.getById(id);
  }

  @Query(() => Departments, { name: 'departments' })
  list(
    @Args({ name: 'offset', type: () => Int, nullable: true })
    offset = 0,
    @Args({ name: 'limit', type: () => Int, nullable: true })
    limit = 10,
  ): Promise<Departments> {
    return this.departmentService.list(offset, limit);
  }

  @ResolveField(() => Employees, {
    name: 'employees',
    description: '현재 부서에 속한 직원 목록',
  })
  listEmployees(
    @Parent() department: Department,
    @Args({ name: 'offset', type: () => Int, nullable: true })
    offset = 0,
    @Args({ name: 'limit', type: () => Int, nullable: true })
    limit = 10,
  ): Promise<Employees> {
    return this.employeeService.listByDepartmentId(
      department.id,
      offset,
      limit,
    );
  }

  @ResolveField(() => EmployeeLogs, {
    name: 'employeeLogs',
    description: '부서에 속한 직원 이력 목록',
  })
  listEmployeeLogs(
    @Parent() department: Department,
    @Args({ name: 'offset', type: () => Int, nullable: true })
    offset = 0,
    @Args({ name: 'limit', type: () => Int, nullable: true })
    limit = 10,
  ): Promise<EmployeeLogs> {
    return this.employeeService.listLogsByDepartmentId(
      department.id,
      offset,
      limit,
    );
  }
}
