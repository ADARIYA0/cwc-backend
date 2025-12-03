import dotenv from "dotenv";

dotenv.config();

export const Env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 5000,

    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DB_SSL: process.env.DB_SSL === "true",
    SSL_CA_CERT: process.env.SSL_CA_CERT ?? "",

    TYPEORM_SYNC: process.env.TYPEORM_SYNC === "true",
    TYPEORM_LOGGING: process.env.TYPEORM_LOGGING === "true",
};

if (!Env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment.");
}

if (Env.DB_SSL && !Env.SSL_CA_CERT) {
    throw new Error("DB_SSL=true but SSL_CA_CERT is not set.");
}
