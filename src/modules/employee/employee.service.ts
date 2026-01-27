import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee as EmployeeEntity, DeptEmp } from '../../typeorm/entities';
import {
  Employee,
  EmployeeLog,
  EmployeeLogs,
  Employees,
  Gender,
} from './employee.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(DeptEmp)
    private readonly deptEmpRepo: Repository<DeptEmp>,
  ) {}

  async getById(id: string): Promise<Employee | null> {
    this.logger.log(`id: ${id}`);

    const employee = await this.employeeRepo.findOne({
      where: { empNo: parseInt(id) },
      relations: ['deptEmps', 'salaries', 'titles'],
    });

    if (!employee) {
      this.logger.warn(`There is no employee with id ${id}!`);
      return null;
    }

    const latestDeptEmp = employee.deptEmps.sort(
      (a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
    )[0];
    const latestSalary = employee.salaries.sort(
      (a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
    )[0];
    const latestTitle = employee.titles.sort(
      (a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
    )[0];

    return plainToInstance(Employee, {
      id: employee.empNo,
      birthDate: employee.birthDate,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
      hireDate: employee.hireDate,
      departmentId: latestDeptEmp?.deptNo,
      title: latestTitle?.title,
      salary: latestSalary?.salary,
    });
  }

  async list(offset: number, limit: number): Promise<Employees> {
    this.logger.log(`offset: ${offset}, limit: ${limit}`);

    const [employees, total] = await this.employeeRepo.findAndCount({
      relations: ['deptEmps', 'salaries', 'titles'],
      skip: offset,
      take: limit,
    });

    return plainToInstance(Employees, {
      total,
      offset,
      limit,
      items: employees.map((employee) => {
        const latestDeptEmp = employee.deptEmps.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];
        const latestSalary = employee.salaries.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];
        const latestTitle = employee.titles.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];

        return plainToInstance(Employee, {
          id: employee.empNo,
          birthDate: employee.birthDate,
          firstName: employee.firstName,
          lastName: employee.lastName,
          gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
          hireDate: employee.hireDate,
          departmentId: latestDeptEmp?.deptNo,
          title: latestTitle?.title,
          salary: latestSalary?.salary,
        });
      }),
    });
  }

  async listByDepartmentId(
    departmentId: string,
    offset: number,
    limit: number,
  ): Promise<Employees> {
    this.logger.log(
      `departmentId: ${departmentId}, offset: ${offset}, limit: ${limit}`,
    );

    const now = new Date();

    const total = await this.employeeRepo
      .createQueryBuilder('e')
      .innerJoin('e.deptEmps', 'de')
      .where('de.deptNo = :deptNo', { deptNo: departmentId })
      .andWhere('de.fromDate <= :now', { now })
      .andWhere('de.toDate >= :now', { now })
      .getCount();

    const employees = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.deptEmps', 'de')
      .leftJoinAndSelect('e.salaries', 's')
      .leftJoinAndSelect('e.titles', 't')
      .innerJoin('e.deptEmps', 'de_filter')
      .where('de_filter.deptNo = :deptNo', { deptNo: departmentId })
      .andWhere('de_filter.fromDate <= :now', { now })
      .andWhere('de_filter.toDate >= :now', { now })
      .skip(offset)
      .take(limit)
      .getMany();

    return plainToInstance(Employees, {
      total,
      offset,
      limit,
      items: employees.map((employee) => {
        const latestDeptEmp = employee.deptEmps.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];
        const latestSalary = employee.salaries.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];
        const latestTitle = employee.titles.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];

        return plainToInstance(Employee, {
          id: employee.empNo,
          birthDate: employee.birthDate,
          firstName: employee.firstName,
          lastName: employee.lastName,
          gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
          hireDate: employee.hireDate,
          departmentId: latestDeptEmp?.deptNo,
          title: latestTitle?.title,
          salary: latestSalary?.salary,
        });
      }),
    });
  }

  async listLogsByDepartmentId(
    departmentId: string,
    offset: number,
    limit: number,
  ): Promise<EmployeeLogs> {
    this.logger.log(
      `departmentId: ${departmentId}, offset: ${offset}, limit: ${limit}`,
    );

    const total = await this.deptEmpRepo.count({
      where: { deptNo: departmentId },
    });

    const deptEmps = await this.deptEmpRepo.find({
      where: { deptNo: departmentId },
      relations: [
        'employee',
        'employee.deptEmps',
        'employee.salaries',
        'employee.titles',
      ],
      order: { fromDate: 'DESC' },
      skip: offset,
      take: limit,
    });

    return plainToInstance(EmployeeLogs, {
      total,
      offset,
      limit,
      items: deptEmps.map((deptEmp) => {
        const employee = deptEmp.employee;
        const latestSalary = employee.salaries.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];
        const latestTitle = employee.titles.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
        )[0];

        return plainToInstance(EmployeeLog, {
          fromDate: deptEmp.fromDate,
          toDate: deptEmp.toDate,
          employee: plainToInstance(Employee, {
            id: employee.empNo,
            birthDate: employee.birthDate,
            firstName: employee.firstName,
            lastName: employee.lastName,
            gender: employee.gender === 'M' ? Gender.MALE : Gender.FEMALE,
            hireDate: employee.hireDate,
            departmentId: deptEmp.deptNo,
            title: latestTitle?.title,
            salary: latestSalary?.salary,
          }),
        });
      }),
    });
  }
}
