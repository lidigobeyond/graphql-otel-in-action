import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Department, DepartmentLog, Departments } from './department.dto';
import { plainToInstance } from 'class-transformer';
import DataLoader from 'dataloader';

@Injectable()
export class DepartmentService {
  private departmentLoader: DataLoader<string, Department | null>;
  constructor(private readonly prisma: PrismaService) {
    this.departmentLoader = new DataLoader<string, Department | null>(
      (keys: string[]) => this.getByIds(keys),
    );
  }

  async getById(id: string): Promise<Department | null> {
    return this.departmentLoader.load(id);
  }

  async getByIds(ids: string[]): Promise<(Department | null)[]> {
    const departments = await this.prisma.departments.findMany({
      where: {
        dept_no: {
          in: ids,
        },
      },
    });

    return ids.map((id) => {
      const department = departments.find(
        (department) => department.dept_no === id,
      );
      if (!department) {
        return null;
      }

      return plainToInstance(Department, {
        id: department.dept_no,
        name: department.dept_name,
      });
    });
  }

  async list(offset: number, limit: number): Promise<Departments> {
    const total = await this.prisma.departments.count();

    const departments = await this.prisma.departments.findMany({
      skip: offset,
      take: limit,
    });

    return {
      total,
      offset,
      limit,
      items: departments.map((department) =>
        plainToInstance(Department, {
          id: department.dept_no,
          name: department.dept_name,
        }),
      ),
    };
  }

  async listLogByEmployeeId(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<DepartmentLog[]> {
    const dept_emps = await this.prisma.dept_emp.findMany({
      where: {
        AND: {
          emp_no: parseInt(employeeId),
          OR: [
            {
              from_date: {
                gte: from,
              },
              to_date: {
                lte: to,
              },
            },
            {
              to_date: {
                lte: to,
              },
            },
          ],
        },
      },
      include: {
        departments: true,
      },
    });

    return dept_emps.map((dept_emp) =>
      plainToInstance(DepartmentLog, {
        fromDate: dept_emp.from_date,
        toDate: dept_emp.to_date,
        department: plainToInstance(Department, {
          id: dept_emp.departments.dept_no,
          name: dept_emp.departments.dept_name,
        }),
      }),
    );
  }
}
