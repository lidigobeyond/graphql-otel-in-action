import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { DeptEmp } from './dept-emp.entity';
import { DeptManager } from './dept-manager.entity';

@Entity('departments')
export class Department {
  @PrimaryColumn({ name: 'dept_no', type: 'char', length: 4 })
  deptNo: string;

  @Column({ name: 'dept_name', type: 'varchar', length: 40, unique: true })
  deptName: string;

  @OneToMany(() => DeptEmp, (deptEmp) => deptEmp.department)
  deptEmps: DeptEmp[];

  @OneToMany(() => DeptManager, (deptManager) => deptManager.department)
  deptManagers: DeptManager[];
}
