import mongoose from "mongoose";
import bluebird from "bluebird";

import { MONGODB_URI } from "../util/secrets";
import logger from "../util/logger";

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
  () => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    logger.debug("Now connected to db.");
  },
).catch(err => {
  logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

export default mongoose;