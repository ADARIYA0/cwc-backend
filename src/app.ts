import express from "express";
import logger from "./infrastructure/logging/logger";
import morgan from "morgan";

const app = express();

app.use(express.json());

morgan.token("date", (req, res, tz) => {
    return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
        hour12: false
    });
});

const morganFormat =
    ':remote-addr - - [:date[Asia/Jakarta] +0700] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

app.use(
    morgan(morganFormat, {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
    })
);

app.get("/status", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: 'Server is healthy',
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

export default app;
