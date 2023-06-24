import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class TestResolver {
  @Query()
  hello(): string {
    return "Hello Vue & NestJs & Fastify";
  }
}
