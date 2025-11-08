import { Module } from '@nestjs/common';
import { GraphQLModule as NestJSGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    NestJSGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      useGlobalPrefix: true,
    }),
  ],
})
export class GraphQLModule {}
