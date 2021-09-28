import express from "express";
import cors from "cors";
import path from "path";
import { createConnection } from "typeorm";

import routes from "./routes";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "restapi",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [path.join(__dirname, "./entity/**/*.*")],
  });
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      credentials: true,
      origin: "*",
    })
  );

  app.get("/", (_req, res) => {
    res.json({ message: "Welcome to API GEN", date: new Date() });
  });

  app.use("/", routes);
  app.use("/auth", authRoutes);

  app.listen(8080, () => {
    console.log("Server started on http://localhost:8080");
  });
};

main();
