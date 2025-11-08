import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Employee,
  EmployeeLog,
  EmployeeLogs,
  Employees,
  Gender,
} from './employee.dto';
import { plainToInstance } from 'class-transformer';
import { Department } from '../department/department.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employees.findUnique({
      where: { emp_no: parseInt(id) },
      include: {
        dept_emp: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        salaries: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        titles: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!employee) {
      return null;
    }

    return plainToInstance(Employee, {
      id: employee.emp_no,
      birthDate: employee.birth_date,
      firstName: employee.first_name,
      lastName: employee.last_name,
      gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
      hireDate: employee.hire_date,
      departmentId: employee.dept_emp[0].dept_no,
      title: employee.titles[0].title,
      salary: employee.salaries[0].salary,
    });
  }

  async list(offset: number, limit: number): Promise<Employees> {
    const total = await this.prisma.employees.count();

    const employees = await this.prisma.employees.findMany({
      skip: offset,
      take: limit,
      include: {
        dept_emp: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        salaries: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        titles: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
      },
    });

    return plainToInstance(Employees, {
      total,
      offset,
      limit,
      items: employees.map((employee) =>
        plainToInstance(Employee, {
          id: employee.emp_no,
          birthDate: employee.birth_date,
          firstName: employee.first_name,
          lastName: employee.last_name,
          gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
          hireDate: employee.hire_date,
          departmentId: employee.dept_emp[0].dept_no,
          title: employee.titles[0].title,
          salary: employee.salaries[0].salary,
        }),
      ),
    });
  }

  async listByDepartmentId(
    departmentId: string,
    offset: number,
    limit: number,
  ): Promise<Employees> {
    const total = await this.prisma.employees.count({
      where: {
        dept_emp: {
          some: {
            dept_no: departmentId,
            from_date: { lte: new Date() },
            to_date: { gte: new Date() },
          },
        },
      },
    });

    const employees = await this.prisma.employees.findMany({
      where: {
        dept_emp: {
          some: {
            dept_no: departmentId,
            from_date: { lte: new Date() },
            to_date: { gte: new Date() },
          },
        },
      },
      skip: offset,
      take: limit,
      include: {
        dept_emp: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        salaries: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        titles: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
      },
    });

    return plainToInstance(Employees, {
      total,
      offset,
      limit,
      items: employees.map((employee) =>
        plainToInstance(Employee, {
          id: employee.emp_no,
          birthDate: employee.birth_date,
          firstName: employee.first_name,
          lastName: employee.last_name,
          gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
          hireDate: employee.hire_date,
          departmentId: employee.dept_emp[0].dept_no,
          title: employee.titles[0].title,
          salary: employee.salaries[0].salary,
        }),
      ),
    });
  }

  async listLogsByDepartmentId(
    departmentId: string,
    offset: number,
    limit: number,
  ): Promise<EmployeeLogs> {
    const total = await this.prisma.dept_emp.count({
      where: {
        dept_no: departmentId,
      },
    });

    const employees = await this.prisma.employees.findMany({
      skip: offset,
      take: limit,
      include: {
        dept_emp: {
          where: {
            dept_no: departmentId,
          },
          orderBy: {
            from_date: 'desc',
          },
        },
        salaries: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
        titles: {
          orderBy: {
            from_date: 'desc',
          },
          take: 1,
        },
      },
    });

    return plainToInstance(EmployeeLogs, {
      total,
      offset,
      limit,
      items: employees.map((employee) =>
        plainToInstance(EmployeeLog, {
          fromDate: employee.dept_emp[0].from_date,
          toDate: employee.dept_emp[0].to_date,
          employee: plainToInstance(Employee, {
            id: employee.emp_no,
            birthDate: employee.birth_date,
            firstName: employee.first_name,
            lastName: employee.last_name,
            gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
            hireDate: employee.hire_date,
            departmentId: employee.dept_emp[0].dept_no,
            title: employee.titles[0].title,
            salary: employee.salaries[0].salary,
          }),
        }),
      ),
    });
  }
}
