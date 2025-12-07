import { isAccessTokenBlacklisted } from "../infrastructure/redis/token-blacklist";
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../application/auth/services/jwt.service";
import logger from "../infrastructure/logging/logger";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                jti: string;
            };
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT access token and checks blacklist
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "UNAUTHORIZED",
                message: "No access token provided",
            });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        const payload = verifyAccessToken(token);
        if (!payload) {
            res.status(401).json({
                error: "UNAUTHORIZED",
                message: "Invalid or expired access token",
            });
            return;
        }

        // Check if token is blacklisted
        const isBlacklisted = await isAccessTokenBlacklisted(payload.jti);
        if (isBlacklisted) {
            logger.debug("Blacklisted token used", {
                userId: payload.sub,
                jti: payload.jti.substring(0, 8) + "...",
            });
            res.status(401).json({
                error: "UNAUTHORIZED",
                message: "Token has been revoked",
            });
            return;
        }

        // Attach user info to request
        req.user = {
            id: payload.sub,
            jti: payload.jti,
        };

        next();
    } catch (error) {
        logger.error("Authentication middleware error", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Authentication failed",
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't block if not
 */
export const optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            next();
            return;
        }

        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (payload) {
            const isBlacklisted = await isAccessTokenBlacklisted(payload.jti);
            if (!isBlacklisted) {
                req.user = {
                    id: payload.sub,
                    jti: payload.jti,
                };
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth, just continue without user
        next();
    }
};
