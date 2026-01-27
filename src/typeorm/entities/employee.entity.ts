import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { DeptEmp } from './dept-emp.entity';
import { DeptManager } from './dept-manager.entity';
import { Salary } from './salary.entity';
import { Title } from './title.entity';

export enum EmployeeGender {
  M = 'M',
  F = 'F',
}

@Entity('employees')
export class Employee {
  @PrimaryColumn({ name: 'emp_no', type: 'int' })
  empNo: number;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ name: 'first_name', type: 'varchar', length: 14 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 16 })
  lastName: string;

  @Column({ name: 'gender', type: 'enum', enum: EmployeeGender })
  gender: EmployeeGender;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate: Date;

  @OneToMany(() => DeptEmp, (deptEmp) => deptEmp.employee)
  deptEmps: DeptEmp[];

  @OneToMany(() => DeptManager, (deptManager) => deptManager.employee)
  deptManagers: DeptManager[];

  @OneToMany(() => Salary, (salary) => salary.employee)
  salaries: Salary[];

  @OneToMany(() => Title, (title) => title.employee)
  titles: Title[];
}
