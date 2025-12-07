import dotenv from "dotenv";

dotenv.config();

export const Env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DB_SSL: process.env.DB_SSL === "true",
    SSL_CA_CERT: process.env.SSL_CA_CERT ?? "",

    TYPEORM_SYNC: process.env.TYPEORM_SYNC === "true",
    TYPEORM_LOGGING: process.env.TYPEORM_LOGGING === "true",

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "",

    REDIS_URL: process.env.REDIS_URL || "",
};

if (!Env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment.");
}

if (Env.DB_SSL && !Env.SSL_CA_CERT) {
    throw new Error("DB_SSL=true but SSL_CA_CERT is not set.");
}

if (!Env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not set in environment.");
}

if (!Env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set in environment.");
}
