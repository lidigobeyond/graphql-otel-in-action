import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import {
  Department as DepartmentEntity,
  DeptEmp,
} from '../../typeorm/entities';
import { Department, DepartmentLog, Departments } from './department.dto';
import { plainToInstance } from 'class-transformer';
import DataLoader from 'dataloader';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(this.constructor.name);

  private departmentLoader: DataLoader<string, Department | null>;

  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    @InjectRepository(DeptEmp)
    private readonly deptEmpRepo: Repository<DeptEmp>,
  ) {
    this.departmentLoader = new DataLoader<string, Department | null>(
      (keys: readonly string[]) => this.getByIds([...keys]),
    );
  }

  async getById(id: string): Promise<Department | null> {
    return this.departmentLoader.load(id);
  }

  async getByIds(ids: string[]): Promise<(Department | null)[]> {
    this.logger.log(`ids: ${ids}`);

    const departments = await this.departmentRepo.find({
      where: { deptNo: In(ids) },
    });

    return ids.map((id) => {
      const department = departments.find((d) => d.deptNo === id);
      if (!department) {
        return null;
      }

      return plainToInstance(Department, {
        id: department.deptNo,
        name: department.deptName,
      });
    });
  }

  async list(offset: number, limit: number): Promise<Departments> {
    this.logger.log(`offset: ${offset}, limit: ${limit}`);

    const [departments, total] = await this.departmentRepo.findAndCount({
      skip: offset,
      take: limit,
    });

    return {
      total,
      offset,
      limit,
      items: departments.map((department) =>
        plainToInstance(Department, {
          id: department.deptNo,
          name: department.deptName,
        }),
      ),
    };
  }

  async listLogByEmployeeId(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<DepartmentLog[]> {
    this.logger.log(`employeeId: ${employeeId}, from: ${from}, to: ${to}`);

    const deptEmps = await this.deptEmpRepo
      .createQueryBuilder('de')
      .leftJoinAndSelect('de.department', 'd')
      .where('de.empNo = :empNo', { empNo: parseInt(employeeId) })
      .andWhere(
        new Brackets((qb) => {
          qb.where('de.fromDate >= :from AND de.toDate <= :to', {
            from,
            to,
          }).orWhere('de.toDate <= :to', { to });
        }),
      )
      .getMany();

    return deptEmps.map((deptEmp) =>
      plainToInstance(DepartmentLog, {
        fromDate: deptEmp.fromDate,
        toDate: deptEmp.toDate,
        department: plainToInstance(Department, {
          id: deptEmp.department.deptNo,
          name: deptEmp.department.deptName,
        }),
      }),
    );
  }
}
