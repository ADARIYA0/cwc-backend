import { RefreshTokenResponseDTO, DeviceInfo } from "../dto/login.dto";
import { SessionRepository } from "../repositories/session.repository";
import { UserRepository } from "../repositories/user.repository";
import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
} from "./jwt.service";
import logger from "../../../infrastructure/logging/logger";

export class RefreshTokenService {
    constructor(
        private readonly sessionRepo: SessionRepository,
        private readonly userRepo: UserRepository
    ) { }

    /**
     * Refresh access token using refresh token
     * - Verify refresh token
     * - Check session exists and is not revoked
     * - Generate new access token
     * - Optionally rotate refresh token
     */
    async refresh(
        refreshToken: string,
        deviceInfo: DeviceInfo,
        rotateRefreshToken: boolean = false
    ): Promise<RefreshTokenResponseDTO & { refreshToken?: string; refreshTokenExpiresAt?: string }> {
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            logger.warn("Invalid refresh token provided", {
                ipAddress: deviceInfo.ipAddress,
            });
            throw new Error("INVALID_REFRESH_TOKEN");
        }

        const session = await this.sessionRepo.findById(payload.sessionId);
        if (!session) {
            logger.warn("Session not found for refresh token", {
                sessionId: payload.sessionId,
            });
            throw new Error("SESSION_NOT_FOUND");
        }

        if (session.revoked) {
            logger.warn("Attempt to use revoked session", {
                userId: session.userId,
                sessionId: session.id,
            });
            throw new Error("SESSION_REVOKED");
        }

        if (new Date() > session.expiresAt) {
            logger.warn("Attempt to use expired session", {
                userId: session.userId,
                sessionId: session.id,
            });
            await this.sessionRepo.deleteSession(session.id);
            throw new Error("SESSION_EXPIRED");
        }

        const providedHash = hashRefreshToken(refreshToken);
        if (providedHash !== session.refreshToken) {
            logger.warn("Refresh token hash mismatch - possible token reuse attack", {
                userId: session.userId,
                sessionId: session.id,
            });
            await this.sessionRepo.revokeSession(session.id);
            throw new Error("INVALID_REFRESH_TOKEN");
        }

        // Verify device info matches (optional security check)
        if (
            session.device !== deviceInfo.device ||
            session.ipAddress !== deviceInfo.ipAddress ||
            session.userAgent !== deviceInfo.userAgent
        ) {
            logger.warn("Device info mismatch during token refresh", {
                userId: session.userId,
                sessionId: session.id,
                expectedDevice: session.device,
                actualDevice: deviceInfo.device,
            });
        }

        const { token: accessToken, expiresAt: accessTokenExpiresAt } =
            generateAccessToken(session.userId);

        logger.debug("Access token refreshed", {
            userId: session.userId,
            sessionId: session.id,
        });

        const response: RefreshTokenResponseDTO & {
            refreshToken?: string;
            refreshTokenExpiresAt?: string;
        } = {
            accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
        };

        if (rotateRefreshToken) {
            const { token: newRefreshToken, expiresAt: newRefreshTokenExpiresAt } =
                generateRefreshToken(session.userId, session.id);

            const newHashedRefreshToken = hashRefreshToken(newRefreshToken);
            await this.sessionRepo.updateRefreshToken(
                session.id,
                newHashedRefreshToken,
                newRefreshTokenExpiresAt
            );

            response.refreshToken = newRefreshToken;
            response.refreshTokenExpiresAt = newRefreshTokenExpiresAt.toISOString();

            logger.debug("Refresh token rotated", {
                userId: session.userId,
                sessionId: session.id,
            });
        }

        return response;
    }
}
