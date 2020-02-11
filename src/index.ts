import errorHandler from "errorhandler";

import app from "./app";
import logger from "./util/logger";
import { IS_PROD } from "./util/secrets";

/**
 * Error Handler. Provides full stack - remove for production
 */
if (process.env.NODE_ENV === "local") app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  logger.info(`App is running at http://localhost:${app.get("port")} in ${app.get("env")} mode`);
  if (!IS_PROD) logger.info("Press CTRL-C to stop\n");
});

export default server;
