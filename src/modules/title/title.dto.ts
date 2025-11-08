import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/graphql/paginated';

@ObjectType({ description: '직책 내역' })
export class TitleLog {
  @Field(() => GraphQLISODateTime, { description: '시작일' })
  fromDate: Date;

  @Field(() => GraphQLISODateTime, { description: '종료일' })
  toDate: Date;

  @Field(() => String, { description: '직책' })
  title: string;
}
