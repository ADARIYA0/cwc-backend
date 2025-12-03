import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {
    LOG_DIR,
    ERROR_LOG_DIR,
    DATE_PATTERN,
    MAX_LOG_FILES,
    MAX_ERROR_LOG_FILES,
    LOG_LEVEL,
    ENV
} from "./config";

const isDevelopment = ENV === "development";

const timeInUTC7 = () => {
    const date = new Date();
    const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return utc7Date.toISOString().replace("T", " ").replace("Z", "");
};

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(
        ({ level, message, ...meta }) =>
            `${timeInUTC7()} [${level}]: ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
            }`
    )
);

const fileFormat = winston.format.combine(
    winston.format.printf(
        ({ level, message, ...meta }) =>
            `${timeInUTC7()} [${level}]: ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
            }`
    )
);

const transports = [
    new winston.transports.Console({
        level: LOG_LEVEL,
        format: consoleFormat,
        handleExceptions: true,
    }),

    new DailyRotateFile({
        level: "info",
        dirname: LOG_DIR,
        filename: "application-%DATE%.log",
        datePattern: DATE_PATTERN,
        zippedArchive: true,
        maxFiles: MAX_LOG_FILES,
        format: fileFormat,
        handleExceptions: true,
    }),

    new DailyRotateFile({
        level: "error",
        dirname: ERROR_LOG_DIR,
        filename: "error-%DATE%.log",
        datePattern: DATE_PATTERN,
        zippedArchive: true,
        maxFiles: MAX_ERROR_LOG_FILES,
        format: fileFormat,
        handleExceptions: true,
    })
];

const logger = winston.createLogger({
    level: LOG_LEVEL,
    levels: winston.config.npm.levels,
    transports,
    exitOnError: false,
});

const stream = {
    write(message: string) {
        logger.info(message.trim());
    },
};

(logger as any).stream = stream;

export default logger;
export { logger, stream };
