import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/graphql/paginated';

@ObjectType({ description: '연봉 내역' })
export class SalaryLog {
  @Field(() => GraphQLISODateTime, { description: '시작일' })
  fromDate: Date;

  @Field(() => GraphQLISODateTime, { description: '종료일' })
  toDate: Date;

  @Field(() => Int, { description: '연봉' })
  amount: number;
}
