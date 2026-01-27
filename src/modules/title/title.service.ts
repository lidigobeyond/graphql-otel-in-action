import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Title as TitleEntity } from '../../typeorm/entities';
import { TitleLog } from './title.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TitleService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(TitleEntity)
    private readonly titleRepo: Repository<TitleEntity>,
  ) {}

  async listLogByEmployeeId(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<TitleLog[]> {
    this.logger.log(`employeeId: ${employeeId}, from: ${from}, to: ${to}`);

    const titles = await this.titleRepo
      .createQueryBuilder('t')
      .where('t.empNo = :empNo', { empNo: parseInt(employeeId) })
      .andWhere(
        new Brackets((qb) => {
          qb.where('t.fromDate >= :from AND t.toDate <= :to', {
            from,
            to,
          }).orWhere('t.toDate <= :to', { to });
        }),
      )
      .orderBy('t.fromDate', 'DESC')
      .getMany();

    return titles.map((title) =>
      plainToInstance(TitleLog, {
        fromDate: title.fromDate,
        toDate: title.toDate,
        title: title.title,
      }),
    );
  }
}
