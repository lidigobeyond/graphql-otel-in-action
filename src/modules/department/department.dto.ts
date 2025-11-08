import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/graphql/paginated';

@ObjectType()
export class Department {
  @Field(() => ID, { description: '부서 ID' })
  id: string;

  @Field(() => String, { description: '이름' })
  name: string;
}

@ObjectType({ description: '(Paginated) 부서 목록' })
export class Departments extends Paginated(Department) {}

@ObjectType({ description: '부서 내역' })
export class DepartmentLog {
  @Field(() => GraphQLISODateTime, { description: '시작일' })
  fromDate: Date;

  @Field(() => GraphQLISODateTime, { description: '종료일' })
  toDate: Date;

  @Field(() => Department, { description: '부서' })
  department: Department;
}
