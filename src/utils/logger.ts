import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const env = process.env.NODE_ENV || "development";
const isDevelopment = env === "development";

const level = isDevelopment ? "debug" : "info";

const timeInUTC7 = () => {
    const date = new Date();
    const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return utc7Date.toISOString().replace("T", " ").replace("Z", "");
};

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(
        ({ level, message, ...meta }) =>
            `${timeInUTC7()} [${level}]: ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.printf(
        ({ level, message, ...meta }) =>
            `${timeInUTC7()} [${level}]: ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""}`
    )
);

const consoleTransport = new winston.transports.Console({
    level,
    format: consoleFormat,
    handleExceptions: true,
});

const rotateTransport = new DailyRotateFile({
    level: "info",
    dirname: "logs",
    filename: "application-%DATE%.log",
    datePattern: "DD-MM-YYYY",
    zippedArchive: true,
    maxFiles: "14d",
    format: fileFormat,
    handleExceptions: true,
});

const errorTransport = new DailyRotateFile({
    level: "error",
    dirname: "logs/error",
    filename: "error-%DATE%.log",
    datePattern: "DD-MM-YYYY",
    zippedArchive: true,
    maxFiles: "30d",
    format: fileFormat,
    handleExceptions: true,
});

const logger = winston.createLogger({
    level,
    levels: winston.config.npm.levels,
    transports: [consoleTransport, rotateTransport, errorTransport],
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
