import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { DatabaseConfig } from "../../../config/database";
import logger from "../../logging/logger";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: DatabaseConfig.url,
    synchronize: DatabaseConfig.synchronize,
    logging: DatabaseConfig.logging,
    entities: [path.join(__dirname, "entities/**/*.{ts,js}")],
    migrations: [path.join(__dirname, "migrations/**/*.{ts,js}")],
    subscribers: [],
    extra: {},
});

export const initializeDataSource = async () => {
    logger.info("Initializing database connection...");

    if (DatabaseConfig.isProduction) {
        if (DatabaseConfig.synchronize) {
            logger.warn(
                "TYPEORM_SYNC=true in production! This is UNSAFE and can modify your schema."
            );
        }

        if (DatabaseConfig.logging) {
            logger.warn(
                "TYPEORM_LOGGING=true in production. Logging is automatically disabled for safety."
            );
        }
    }

    if (DatabaseConfig.sslEnabled) {
        const ca = fs.readFileSync(
            path.resolve(DatabaseConfig.caCertPath),
            "utf8"
        );

        (AppDataSource.options.extra as any).ssl = {
            ca,
            rejectUnauthorized: true,
        };

        logger.info(
            `SSL enabled using CA certificate: ${DatabaseConfig.caCertPath}`
        );
    }

    await AppDataSource.initialize();
    logger.info("Database connected successfully.");
};
