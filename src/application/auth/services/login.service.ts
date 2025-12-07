import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
} from "./jwt.service";
import { LoginDTO, LoginResponseDTO, DeviceInfo } from "../dto/login.dto";
import { SessionRepository } from "../repositories/session.repository";
import { UserRepository } from "../repositories/user.repository";
import argon2 from "argon2";
import logger from "../../../infrastructure/logging/logger";

export class LoginService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly sessionRepo: SessionRepository
    ) { }

    async login(
        dto: LoginDTO,
        deviceInfo: DeviceInfo
    ): Promise<LoginResponseDTO> {
        const email = dto.email.toLowerCase().trim();

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            logger.warn("Login attempt with non-existent email", {
                ipAddress: deviceInfo.ipAddress,
            });
            throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await argon2.verify(user.password, dto.password);
        if (!isPasswordValid) {
            logger.warn("Login attempt with invalid password", {
                userId: user.id,
                ipAddress: deviceInfo.ipAddress,
            });
            throw new Error("INVALID_CREDENTIALS");
        }

        const existingSession = await this.sessionRepo.findByUserIdAndDevice(
            user.id,
            deviceInfo.device,
            deviceInfo.ipAddress,
            deviceInfo.userAgent
        );

        if (existingSession) {
            await this.sessionRepo.deleteSession(existingSession.id);
            logger.debug("Existing session removed for new login", {
                userId: user.id,
                sessionId: existingSession.id,
            });
        }

        const { token: accessToken, expiresAt: accessTokenExpiresAt } =
            generateAccessToken(user.id);

        const tempSession = await this.sessionRepo.create({
            userId: user.id,
            refreshToken: "temp",
            device: deviceInfo.device,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            expiresAt: new Date(),
        });

        const { token: refreshToken, expiresAt: refreshTokenExpiresAt } =
            generateRefreshToken(user.id, tempSession.id);

        const hashedRefreshToken = hashRefreshToken(refreshToken);
        await this.sessionRepo.updateRefreshToken(
            tempSession.id,
            hashedRefreshToken,
            refreshTokenExpiresAt
        );

        logger.info("User logged in successfully", {
            userId: user.id,
            sessionId: tempSession.id,
            device: deviceInfo.device,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                accountType: user.accountType,
            },
            tokens: {
                accessToken,
                refreshToken,
                accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
                refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
            },
        };
    }
}
