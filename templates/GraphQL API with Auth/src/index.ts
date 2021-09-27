import "reflect-metadata";
import express from "express";
import cors from "cors";
import session from "express-session";
import connectRedis from "connect-redis";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { createConnection } from "typeorm";
import { join } from "path";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";

import { __prod__ } from "./constants";
import { UserResolver } from "./resolvers/user";
import { redis } from "./redis";

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

  const RedisStore = connectRedis(session);

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: "qid",
      secret: "your secret stuff",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    }) as any
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }: any) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(
      `Server started on http://localhost:5050${apolloServer.graphqlPath}`
    );
  });
};

main();
