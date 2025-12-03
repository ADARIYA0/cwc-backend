import { Env } from "./env";

export const DatabaseConfig = {
    url: Env.DATABASE_URL,
    sslEnabled: Env.DB_SSL,
    caCertPath: Env.SSL_CA_CERT,

    synchronize: Env.TYPEORM_SYNC,
    logging: Env.TYPEORM_LOGGING && Env.NODE_ENV !== "production",
    isProduction: Env.NODE_ENV === "production",
};
