import { getRedisClient } from "./client";
import logger from "../logging/logger";

const BLACKLIST_PREFIX = "token:blacklist:";

/**
 * Add an access token to the blacklist
 * @param jti - JWT ID (unique identifier for the token)
 * @param expiresInSeconds - TTL in seconds (should match token expiry)
 */
export const blacklistAccessToken = async (
    jti: string,
    expiresInSeconds: number
): Promise<void> => {
    const client = await getRedisClient();
    const key = `${BLACKLIST_PREFIX}${jti}`;

    await client.setEx(key, expiresInSeconds, "1");
    logger.debug("Access token blacklisted", { jti: jti.substring(0, 8) + "..." });
};

/**
 * Check if an access token is blacklisted
 * @param jti - JWT ID to check
 * @returns true if blacklisted, false otherwise
 */
export const isAccessTokenBlacklisted = async (jti: string): Promise<boolean> => {
    const client = await getRedisClient();
    const key = `${BLACKLIST_PREFIX}${jti}`;

    const result = await client.exists(key);
    return result === 1;
};

/**
 * Remove a token from blacklist (if needed for cleanup)
 * @param jti - JWT ID to remove
 */
export const removeFromBlacklist = async (jti: string): Promise<void> => {
    const client = await getRedisClient();
    const key = `${BLACKLIST_PREFIX}${jti}`;

    await client.del(key);
    logger.debug("Token removed from blacklist", { jti: jti.substring(0, 8) + "..." });
};
