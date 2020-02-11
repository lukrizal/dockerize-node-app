import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDirPath = path.join(process.cwd(), "./logs")

let drTransport = new DailyRotateFile({
  level: 'info',
  frequency: '24h',
  dirname: logDirPath,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: 14,
  handleExceptions: false,
  json: true,
  format: winston.format.combine(
     winston.format.timestamp(),
     winston.format.json()
  )
});

const options: winston.LoggerOptions = {
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === "production" ? "error" : "debug"
      }),
      drTransport
    ]
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
