import { existsSync } from "node:fs";

// Local development: variables are read from api/.env, which is never committed (see .env.example).
// On Render, they come from render.yaml and the dashboard: there is no .env file there.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}: copy api/.env.example to api/.env and fill it in.`);
  }
  return value;
}

export interface AppConfig {
  port: number;
  // Full connection URL, password included: it only ever comes from the environment
  databaseUrl: string;
  // "true" or "false" forces SSL on or off; when undefined, it is deduced from the database host
  databaseSsl?: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: requiredEnv("DATABASE_URL"),
  databaseSsl: process.env.DB_SSL,
};

export default config;
