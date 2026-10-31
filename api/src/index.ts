import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import config from "./config";
import db from "./models";
import initRoutes from "./routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

initRoutes(app);

// Readable cause of a connection error. Sequelize keeps the driver's error in "parent", and
// "localhost" tries IPv6 then IPv4: Node groups both failures in an AggregateError without a message
function describeError(err: unknown): string {
  if (err instanceof AggregateError) {
    return err.errors.map(describeError).join(" / ");
  }
  if (err instanceof Error) {
    const parent = (err as Error & { parent?: unknown }).parent;
    return err.message || (parent ? describeError(parent) : err.name);
  }
  return String(err);
}

// The table is created by api/sql/create-table-pollution.sql, not by the API: this checks that it
// exists with every column of the model (an old version of the table would fail on every request)
async function checkPollutionTable(): Promise<void> {
  const tableColumns = Object.keys(await db.pollutions.describe());
  const missing = Object.values(db.pollutions.getAttributes())
    .map((attribute) => attribute.field ?? "")
    .filter((column) => !tableColumns.includes(column));
  if (missing.length > 0) {
    throw new Error(`missing columns ${missing.join(", ")}`);
  }
}

// The API only listens once the database is reachable and the table is ready: a wrong configuration
// stops it with a clear message, instead of starting an API that fails on every request
async function start(): Promise<void> {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to the database.");
  } catch (err: unknown) {
    console.error(`Unable to connect to the database: ${describeError(err)}`);
    process.exit(1);
  }

  try {
    await checkPollutionTable();
  } catch (err: unknown) {
    console.error(
      `The "pollution" table is not ready (${describeError(err)}): run api/sql/create-table-pollution.sql in pgAdmin.`
    );
    process.exit(1);
  }

  // listen on 0.0.0.0 for Render and container environments
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${config.port}.`);
  });
}

start();

export default app;
