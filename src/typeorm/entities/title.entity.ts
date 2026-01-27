import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('titles')
export class Title {
  @PrimaryColumn({ name: 'emp_no', type: 'int' })
  empNo: number;

  @PrimaryColumn({ name: 'title', type: 'varchar', length: 50 })
  title: string;

  @PrimaryColumn({ name: 'from_date', type: 'date' })
  fromDate: Date;

  @Column({ name: 'to_date', type: 'date', nullable: true })
  toDate: Date | null;

  @ManyToOne(() => Employee, (employee) => employee.titles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emp_no' })
  employee: Employee;
}
