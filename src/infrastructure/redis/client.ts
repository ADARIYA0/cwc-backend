import { createClient, RedisClientType } from "redis";
import { Env } from "../../config/env";
import logger from "../logging/logger";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    redisClient = createClient({
        url: Env.REDIS_URL,
    });

    redisClient.on("error", (err: Error) => {
        logger.error("Redis client error", { error: err.message });
    });

    redisClient.on("connect", () => {
        logger.info("Redis client connecting...");
    });

    redisClient.on("ready", () => {
        logger.info("Redis client ready");
    });

    redisClient.on("reconnecting", () => {
        logger.warn("Redis client reconnecting...");
    });

    await redisClient.connect();

    return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        logger.info("Redis client disconnected");
        redisClient = null;
    }
};

export { redisClient };
