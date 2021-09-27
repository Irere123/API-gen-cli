import { Resolver, Query } from "type-graphql";

@Resolver()
export class HelloWorldResolver {
  @Query(() => String)
  hello() {
    return "Hello from TS API GEN";
  }
}
