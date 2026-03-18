import { Module } from '@nestjs/common';
import { GraphQLModule as NestJSGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { wrapResolversWithTracing } from '../common/tracing/schema-tracing';

@Module({
  imports: [
    NestJSGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      useGlobalPrefix: true,
      csrfPrevention: false,
      introspection: true,
      playground: true,
      transformSchema: (schema) => wrapResolversWithTracing(schema),
    }),
  ],
})
export class GraphQLModule {}
