export const CorsEnv = {
    ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || "").trim(),
    ALLOW_CREDENTIALS: process.env.CORS_ALLOW_CREDENTIALS === "true",
    ALLOWED_METHODS: (process.env.CORS_ALLOWED_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS").split(",").map(s => s.trim()),
    ALLOWED_HEADERS: (process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization").split(",").map(s => s.trim()),
    PREFLIGHT_MAXAGE: Number(process.env.CORS_PREFLIGHT_MAXAGE || "600"),
};
