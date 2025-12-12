import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { DatabaseConfig } from "../../../config/database";
import logger from "../../logging/logger";

let sslOption: false | { ca: string; rejectUnauthorized: boolean } = false;

if (DatabaseConfig.sslEnabled) {
    const resolved = path.resolve(process.cwd(), DatabaseConfig.caCertPath);

    if (!fs.existsSync(resolved)) {
        throw new Error(`SSL CA certificate not found at path: ${resolved}`);
    }

    const ca = fs.readFileSync(resolved, "utf8");

    sslOption = {
        ca,
        rejectUnauthorized: true,
    };

    logger.info(`SSL is enabled and CA loaded from: ${resolved}`);
}

export const AppDataSource = new DataSource({
    type: "postgres",
    url: DatabaseConfig.url,
    synchronize: DatabaseConfig.synchronize,
    logging: DatabaseConfig.logging,
    entities: [path.join(__dirname, "entities/**/*.{ts,js}")],
    subscribers: [],
    extra: {
        ssl: sslOption
    },
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

    await AppDataSource.initialize();
    logger.info("Database connected successfully.");
};
