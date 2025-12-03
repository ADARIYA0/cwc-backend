import { Env } from "./config/env";
import { initializeDataSource } from "./infrastructure/database/typeorm/data-source";
import app from "./app";
import logger from "./utils/logger";

const PORT = Number(Env.PORT || 5000);
const HOST = "0.0.0.0";

(async () => {
    try {
        await initializeDataSource();
        logger.info("Database initialization complete. Starting server...");

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
                logger.info("Server closed. Exiting process.");
                process.exit(0);
            });

            setTimeout(() => {
                logger.error("Force shutdown timeout reached. Exiting now.");
                process.exit(1);
            }, 10000).unref();
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

        process.on("uncaughtException", (err: any) => {
            logger.error("Uncaught Exception:", {
                message: err.message,
                stack: err.stack,
            });
            process.exit(1);
        });

        process.on("unhandledRejection", (reason: unknown) => {
            logger.error("Unhandled Rejection:", { reason });
            process.exit(1);
        });
    } catch (err: any) {
        logger.error("Failed to start application:", {
            message: err.message,
            stack: err.stack,
        });
        process.exit(1);
    }
})();
