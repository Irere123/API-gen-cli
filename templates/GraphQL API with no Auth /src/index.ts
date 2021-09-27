import "reflect-metadata";
import express from "express";
import cors from "cors";
import { join } from "path";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { HelloWorldResolver } from "./resolvers/hello";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "dbname",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [join(__dirname, "./entity/**/*.*")],
  });

  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloWorldResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }: any) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(
      `Server started on http://localhost:4000${apolloServer.graphqlPath}`
    );
  });
};

main();
