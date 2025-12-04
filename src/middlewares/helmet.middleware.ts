import helmet from "helmet";

export default function applySecurityHeaders() {
    return helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    });
}
