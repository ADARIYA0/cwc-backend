import { Request, Response, NextFunction } from "express";
import { CorsEnv } from "../config/cors";
import cors, { CorsOptions } from "cors";
import logger from "../infrastructure/logging/logger";

const allowedOrigins = CorsEnv.ALLOWED_ORIGINS
    ? CorsEnv.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
    : [];

const originChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
        return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    logger.warn("CORS rejected origin", { origin });
    return callback(new Error("Not allowed by CORS"), false);
};

const corsOptions: CorsOptions = {
    origin: originChecker,
    credentials: CorsEnv.ALLOW_CREDENTIALS,
    methods: CorsEnv.ALLOWED_METHODS,
    allowedHeaders: CorsEnv.ALLOWED_HEADERS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: CorsEnv.PREFLIGHT_MAXAGE,
};

const corsMiddleware = cors(corsOptions);

export default function applyCors(req: Request, res: Response, next: NextFunction) {
    return corsMiddleware(req, res, next);
}
