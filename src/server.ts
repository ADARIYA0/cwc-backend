import app from "./app";
import dotenv from "dotenv";
import logger from "./utils/logger";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running on http://${HOST}:${PORT}`);
});

const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close((err?: Error) => {
        if (err) {
            logger.error("Error during server close:", err);
            process.exit(1);
        }
        logger.info("All connections closed. Exiting process.");
        process.exit(0);
    });

    setTimeout(() => {
        logger.error("Forcing shutdown after timeout.");
        process.exit(1);
    }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception - shutting down:", { message: err.message, stack: err.stack });
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled Rejection - shutting down:", { reason });
    process.exit(1);
})
