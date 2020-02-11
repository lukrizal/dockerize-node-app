import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import mongo from "connect-mongo";
import morgan from "morgan";
import path from "path";
import { SESSION_SECRET, APP_PORT } from "./util/secrets";
import { expressMiddleware as githubMW } from "./lib/Github";
import mongoose from "./config/db";
const MongoStore = mongo(session);

// Controllers (route handlers)
import apiController from "./controllers/api";
import * as genericController from "./controllers/generic";

// Create Express server
const app = express();

// Express configuration
app.set("port", APP_PORT);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
// app.use(); // before middleware

// Github - since we assume that we will always be using github, then better to have singleton for it
app.use(githubMW);

// routes
app.get("/", (req, res, next) => {
  return res.json({ status: "ok" });
});
app.use("/api", apiController);

// general response
app.use(genericController.handler404);
app.use(genericController.handler500);

app.locals.dbCon = mongoose.connection;

export default app;
