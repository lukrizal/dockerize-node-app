import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export const ENVIRONMENT = process.env.NODE_ENV;

export const IS_DEV = ["dev", "local", "development"].includes(ENVIRONMENT);

export const IS_TEST = ["test", "testing"].includes(ENVIRONMENT);

export const IS_PROD = !IS_DEV && !IS_TEST;

// we only use dotenv on test environment since we are not dockerizing our test
if (IS_TEST) {
  const envPath = `envs/${ENVIRONMENT}.env`;
  const fullPath = path.join(process.cwd(), envPath);
  if (fs.existsSync(envPath)) {
    logger.debug(`Using ${envPath} file to supply config environment variables`);
    dotenv.config({ path: fullPath });
  } else {
    logger.error(`Missing env file ${fullPath}`);
    process.exit(1);
  }
}

export const SESSION_SECRET = process.env.SESSION_SECRET;
export const MONGODB_URI = process.env.MONGODB_URI;

export const GITHUB_PAT = process.env.GITHUB_PAT;

export const APP_PORT = process.env.APP_PORT;

if (!SESSION_SECRET) {
  logger.error("No client secret. Set SESSION_SECRET environment variable.");
  process.exit(1);
}

if (!MONGODB_URI) {
  logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
  process.exit(1);
}

if (!APP_PORT) {
  logger.error("Application port is missing. Set APP_PORT environment variable.");
  process.exit(1);
}

logger.debug("envs", {
  SESSION_SECRET,
  MONGODB_URI,
  APP_PORT
});