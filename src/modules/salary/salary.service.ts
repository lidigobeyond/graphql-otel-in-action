import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalaryLog } from './salary.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogByEmployeeId(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<SalaryLog[]> {
    const salaries = await this.prisma.salaries.findMany({
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
      orderBy: {
        from_date: 'desc',
      },
    });

    return salaries.map((salary) =>
      plainToInstance(SalaryLog, {
        fromDate: salary.from_date,
        toDate: salary.to_date,
        amount: salary.salary,
      }),
    );
  }
}
