import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Department } from './department.entity';

@Entity('dept_manager')
@Index('dept_no', ['deptNo'])
export class DeptManager {
  @PrimaryColumn({ name: 'emp_no', type: 'int' })
  empNo: number;

  @PrimaryColumn({ name: 'dept_no', type: 'char', length: 4 })
  deptNo: string;

  @Column({ name: 'from_date', type: 'date' })
  fromDate: Date;

  @Column({ name: 'to_date', type: 'date' })
  toDate: Date;

  @ManyToOne(() => Employee, (employee) => employee.deptManagers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emp_no' })
  employee: Employee;

  @ManyToOne(() => Department, (department) => department.deptManagers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dept_no' })
  department: Department;
}
