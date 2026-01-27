import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Salary as SalaryEntity } from '../../typeorm/entities';
import { SalaryLog } from './salary.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SalaryService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(SalaryEntity)
    private readonly salaryRepo: Repository<SalaryEntity>,
  ) {}

  async listLogByEmployeeId(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<SalaryLog[]> {
    this.logger.log(`employeeId: ${employeeId}, from: ${from}, to: ${to}`);

    const salaries = await this.salaryRepo
      .createQueryBuilder('s')
      .where('s.empNo = :empNo', { empNo: parseInt(employeeId) })
      .andWhere(
        new Brackets((qb) => {
          qb.where('s.fromDate >= :from AND s.toDate <= :to', {
            from,
            to,
          }).orWhere('s.toDate <= :to', { to });
        }),
      )
      .orderBy('s.fromDate', 'DESC')
      .getMany();

    return salaries.map((salary) =>
      plainToInstance(SalaryLog, {
        fromDate: salary.fromDate,
        toDate: salary.toDate,
        amount: salary.salary,
      }),
    );
  }
}
