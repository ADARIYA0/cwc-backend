import { blacklistAccessToken } from "../../../infrastructure/redis/token-blacklist";
import { DeviceInfo } from "../dto/login.dto";
import { SessionRepository } from "../repositories/session.repository";
import {
    verifyAccessToken,
    hashRefreshToken,
    getAccessTokenExpirySeconds,
    decodeTokenUnsafe,
} from "./jwt.service";
import logger from "../../../infrastructure/logging/logger";

export class LogoutService {
    constructor(private readonly sessionRepo: SessionRepository) { }

    /**
     * Logout from current device only
     * - Blacklist the access token in Redis
     * - Delete the session from database
     */
    async logout(
        accessToken: string,
        refreshToken: string,
        deviceInfo: DeviceInfo
    ): Promise<void> {
        const accessPayload = verifyAccessToken(accessToken);

        if (accessPayload) {
            const expirySeconds = getAccessTokenExpirySeconds();
            await blacklistAccessToken(accessPayload.jti, expirySeconds);

            logger.debug("Access token blacklisted on logout", {
                userId: accessPayload.sub,
            });
        } else {
            // Token might be expired, try to decode without verification
            const decoded = decodeTokenUnsafe(accessToken);
            if (decoded && decoded.jti) {
                // Still blacklist it with a short TTL (in case it's still valid somewhere)
                await blacklistAccessToken(decoded.jti as string, 60);
            }
        }

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        const session = await this.sessionRepo.findByRefreshToken(hashedRefreshToken);

        if (session) {
            await this.sessionRepo.deleteSession(session.id);
            logger.info("User logged out", {
                userId: session.userId,
                sessionId: session.id,
                device: deviceInfo.device,
            });
        } else {
            // Session not found, might be already logged out or invalid token
            // Try to delete by device info if we have user ID from token
            const decoded = decodeTokenUnsafe(accessToken);
            if (decoded && decoded.sub) {
                await this.sessionRepo.deleteByUserIdAndDevice(
                    decoded.sub as string,
                    deviceInfo.device,
                    deviceInfo.ipAddress,
                    deviceInfo.userAgent
                );
                logger.info("Session deleted by device info", {
                    userId: decoded.sub,
                    device: deviceInfo.device,
                });
            } else {
                logger.warn("Logout attempted but no valid session found", {
                    device: deviceInfo.device,
                    ipAddress: deviceInfo.ipAddress,
                });
            }
        }
    }

    /**
     * Logout from all devices
     * - Blacklist current access token
     * - Revoke all sessions for the user
     */
    async logoutAll(accessToken: string, userId: string): Promise<number> {
        const accessPayload = verifyAccessToken(accessToken);
        if (accessPayload) {
            const expirySeconds = getAccessTokenExpirySeconds();
            await blacklistAccessToken(accessPayload.jti, expirySeconds);
        }

        const sessions = await this.sessionRepo.findActiveSessionsByUserId(userId);
        const sessionCount = sessions.length;

        await this.sessionRepo.revokeAllUserSessions(userId);

        logger.info("User logged out from all devices", {
            userId,
            sessionsRevoked: sessionCount,
        });

        return sessionCount;
    }
}
