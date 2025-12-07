import { Env } from "../../../config/env";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import logger from "../../../infrastructure/logging/logger";

export interface AccessTokenPayload {
    sub: string;
    jti: string;
    type: "access";
}

export interface RefreshTokenPayload {
    sub: string;
    sessionId: string;
    type: "refresh";
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
}

const parseDurationToSeconds = (duration: string): number => {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;

    switch (unit) {
        case "s": return value;
        case "m": return value * 60;
        case "h": return value * 60 * 60;
        case "d": return value * 60 * 60 * 24;
        default: throw new Error(`Unknown time unit: ${unit}`);
    }
};

export const generateJti = (): string => {
    return crypto.randomUUID();
};

export const generateAccessToken = (userId: string): { token: string; jti: string; expiresAt: Date } => {
    const jti = generateJti();
    const expiresInSeconds = parseDurationToSeconds(Env.JWT_ACCESS_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const payload: AccessTokenPayload = {
        sub: userId,
        jti,
        type: "access",
    };

    const options: SignOptions = {
        expiresIn: expiresInSeconds,
        algorithm: "HS256",
    };

    const token = jwt.sign(payload, Env.JWT_ACCESS_SECRET, options);

    logger.debug("Access token generated", { userId, jti: jti.substring(0, 8) + "..." });

    return { token, jti, expiresAt };
};

export const generateRefreshToken = (userId: string, sessionId: string): { token: string; expiresAt: Date } => {
    const expiresInSeconds = parseDurationToSeconds(Env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const payload: RefreshTokenPayload = {
        sub: userId,
        sessionId,
        type: "refresh",
    };

    const options: SignOptions = {
        expiresIn: expiresInSeconds,
        algorithm: "HS256",
    };

    const token = jwt.sign(payload, Env.JWT_REFRESH_SECRET, options);

    logger.debug("Refresh token generated", { userId, sessionId });

    return { token, expiresAt };
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
    try {
        const decoded = jwt.verify(token, Env.JWT_ACCESS_SECRET) as JwtPayload & AccessTokenPayload;

        if (decoded.type !== "access") {
            logger.warn("Invalid token type for access token verification");
            return null;
        }

        return {
            sub: decoded.sub,
            jti: decoded.jti,
            type: decoded.type,
        };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.debug("Access token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn("Invalid access token");
        }
        return null;
    }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
    try {
        const decoded = jwt.verify(token, Env.JWT_REFRESH_SECRET) as JwtPayload & RefreshTokenPayload;

        if (decoded.type !== "refresh") {
            logger.warn("Invalid token type for refresh token verification");
            return null;
        }

        return {
            sub: decoded.sub,
            sessionId: decoded.sessionId,
            type: decoded.type,
        };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.debug("Refresh token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn("Invalid refresh token");
        }
        return null;
    }
};

export const hashRefreshToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const getAccessTokenExpirySeconds = (): number => {
    return parseDurationToSeconds(Env.JWT_ACCESS_EXPIRES_IN);
};

export const getRefreshTokenExpirySeconds = (): number => {
    return parseDurationToSeconds(Env.JWT_REFRESH_EXPIRES_IN);
};

export const decodeTokenUnsafe = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        return decoded;
    } catch {
        return null;
    }
};
