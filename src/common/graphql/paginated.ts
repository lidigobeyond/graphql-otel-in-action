import { Type, Abstract } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface IPaginationType<Item> {
  total: number;
  offset: number;
  limit: number;
  items?: Item[];
}

export const Paginated = <Item>(
  classRef: Type<Item> | Abstract<Item> | Item,
): Type<IPaginationType<Item>> => {
  @ObjectType({ isAbstract: true })
  class PaginationType implements IPaginationType<Item> {
    @Field(() => Int, { description: '총 개수' })
    total: number;

    @Field(() => Int, { description: '페이지' })
    offset: number;

    @Field(() => Int, { description: '페이지당 개수' })
    limit: number;

    @Field(() => [classRef])
    items: Item[];
  }

  return PaginationType;
};
