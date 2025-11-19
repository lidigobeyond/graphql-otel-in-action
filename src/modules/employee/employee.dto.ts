import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Department } from '../department/department.dto';
import { Paginated } from '../../common/graphql/paginated';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

registerEnumType(Gender, {
  name: 'Gender',
  description: '성별',
  valuesMap: {
    MALE: { description: '남성' },
    FEMALE: { description: '여성' },
  },
});

@ObjectType()
export class Employee {
  @Field(() => ID, { description: '사번' })
  id: string;

  @Field(() => GraphQLISODateTime, { description: '생년월일' })
  birthDate: Date;

  @Field(() => String, { description: '이름' })
  firstName: string;

  @Field(() => String, { description: '성' })
  lastName: string;

  @Field(() => Gender, { description: '성별' })
  gender: Gender;

  @Field(() => GraphQLISODateTime, { description: '입사일' })
  hireDate: Date;

  @Field(() => String, { description: '소속 부서 ID' })
  departmentId: string;

  @Field(() => String, { description: '직책' })
  title: string;

  @Field(() => Int, { description: '연봉' })
  salary: number;
}

@ObjectType({ description: '(Paginated) 직원 목록' })
export class Employees extends Paginated(Employee) {}

@ObjectType({ description: '부서에 속한 직원 이력' })
export class EmployeeLog {
  @Field(() => GraphQLISODateTime, { description: '시작일' })
  fromDate: Date;

  @Field(() => GraphQLISODateTime, { description: '종료일' })
  toDate: Date;

  @Field(() => Employee, { description: '직원' })
  employee: Employee;
}

@ObjectType({ description: '(Paginated) 부서에 속한 직원 이력' })
export class EmployeeLogs extends Paginated(EmployeeLog) {}
