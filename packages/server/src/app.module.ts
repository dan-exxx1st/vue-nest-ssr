import { ApolloDriverConfig, ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { join } from "node:path";
import { TestResolver } from "./graphql/test.resolver";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "packages/server/src/graphql.ts"),
        outputAs: "class",
      },
    }),
  ],
  providers: [PrismaService, TestResolver],
})
export class AppModule {}
