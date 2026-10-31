import { Sequelize } from "sequelize";
import config from "../config";
import definePollutions, { PollutionModel } from "./pollutions.model";

// Render's external URL (host ending in .render.com, used locally and by pgAdmin) requires SSL.
// Its internal URL (host without a domain, used by the API deployed on Render) and a local database do not.
function useSsl(databaseUrl: string): boolean {
  if (config.databaseSsl !== undefined) {
    return config.databaseSsl === "true";
  }
  const { hostname } = new URL(databaseUrl);
  return hostname.includes(".") && hostname !== "127.0.0.1";
}

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: useSsl(config.databaseUrl)
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  define: {
    timestamps: false
  },
  // SQL queries are not printed: set DB_LOGGING=true to see them while debugging
  logging: process.env.DB_LOGGING === "true" ? console.log : false
});

export interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  pollutions: PollutionModel;
}

export const db: Database = {
  Sequelize,
  sequelize,
  pollutions: definePollutions(sequelize, Sequelize)
};

export default db;
