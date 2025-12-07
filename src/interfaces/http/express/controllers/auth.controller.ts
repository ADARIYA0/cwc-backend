import { extractDeviceInfo } from "../../../../application/auth/utils/device-info";
import { loginSchema, refreshTokenSchema } from "../../../../application/auth/validators/login.validator";
import { LoginService } from "../../../../application/auth/services/login.service";
import { LogoutService } from "../../../../application/auth/services/logout.service";
import { Request, Response } from "express";
import { registerSchema } from "../../../../application/auth/validators/register.validator";
import { RegisterService } from "../../../../application/auth/services/register.service";
import { RefreshTokenService } from "../../../../application/auth/services/refresh-token.service";
import { UserRepository } from "../../../../application/auth/repositories/user.repository";
import { SessionRepository } from "../../../../application/auth/repositories/session.repository";
import logger from "../../../../infrastructure/logging/logger";

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const registerService = new RegisterService(userRepo);
const loginService = new LoginService(userRepo, sessionRepo);
const logoutService = new LogoutService(sessionRepo);
const refreshTokenService = new RefreshTokenService(sessionRepo, userRepo);

export async function registerHandler(req: Request, res: Response) {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parseResult.error.flatten() });
        }

        const dto = parseResult.data;

        const user = await registerService.register(dto);

        return res.status(201).json({
            message: "User created",
            data: user
        });
    } catch (err: any) {
        if (err.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
        }

        logger.error("Registration failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function loginHandler(req: Request, res: Response) {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parseResult.error.flatten(),
            });
        }

        const dto = parseResult.data;
        const deviceInfo = extractDeviceInfo(req);

        const result = await loginService.login(dto, deviceInfo);

        return res.status(200).json({
            message: "Login successful",
            data: result,
        });
    } catch (err: any) {
        if (err.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                error: "INVALID_CREDENTIALS",
                message: "Invalid email or password",
            });
        }

        logger.error("Login failed", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function logoutHandler(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "No access token provided",
            });
        }
        const accessToken = authHeader.substring(7);

        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Refresh token is required",
            });
        }

        const deviceInfo = extractDeviceInfo(req);

        await logoutService.logout(accessToken, refreshToken, deviceInfo);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (err: any) {
        logger.error("Logout failed", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function logoutAllHandler(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "No access token provided",
            });
        }
        const accessToken = authHeader.substring(7);

        // User ID should be attached by auth middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const sessionsRevoked = await logoutService.logoutAll(accessToken, userId);

        return res.status(200).json({
            message: "Logged out from all devices",
            data: { sessionsRevoked },
        });
    } catch (err: any) {
        logger.error("Logout all failed", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function refreshTokenHandler(req: Request, res: Response) {
    try {
        const parseResult = refreshTokenSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parseResult.error.flatten(),
            });
        }

        const { refreshToken } = parseResult.data;
        const deviceInfo = extractDeviceInfo(req);

        // Check if rotation is requested (optional query param)
        const rotateToken = req.query.rotate === "true";

        const result = await refreshTokenService.refresh(
            refreshToken,
            deviceInfo,
            rotateToken
        );

        return res.status(200).json({
            message: "Token refreshed successfully",
            data: result,
        });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            INVALID_REFRESH_TOKEN: { status: 401, message: "Invalid refresh token" },
            SESSION_NOT_FOUND: { status: 401, message: "Session not found" },
            SESSION_REVOKED: { status: 401, message: "Session has been revoked" },
            SESSION_EXPIRED: { status: 401, message: "Session has expired" },
        };

        const errorInfo = errorMap[err.message];
        if (errorInfo) {
            return res.status(errorInfo.status).json({
                error: err.message,
                message: errorInfo.message,
            });
        }

        logger.error("Token refresh failed", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getSessionsHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const sessions = await sessionRepo.findActiveSessionsByUserId(userId);

        const sanitizedSessions = sessions.map((session) => ({
            id: session.id,
            device: session.device,
            ipAddress: session.ipAddress,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
        }));

        return res.status(200).json({
            message: "Sessions retrieved successfully",
            data: sanitizedSessions,
        });
    } catch (err: any) {
        logger.error("Get sessions failed", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
