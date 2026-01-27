import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('salaries')
export class Salary {
  @PrimaryColumn({ name: 'emp_no', type: 'int' })
  empNo: number;

  @PrimaryColumn({ name: 'from_date', type: 'date' })
  fromDate: Date;

  @Column({ name: 'salary', type: 'int' })
  salary: number;

  @Column({ name: 'to_date', type: 'date' })
  toDate: Date;

  @ManyToOne(() => Employee, (employee) => employee.salaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emp_no' })
  employee: Employee;
}
