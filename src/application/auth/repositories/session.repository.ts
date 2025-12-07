import { AppDataSource } from "../../../infrastructure/database/typeorm/data-source";
import { Repository } from "typeorm";
import { Session } from "../../../infrastructure/database/typeorm/entities/Session";

export interface CreateSessionData {
    userId: string;
    refreshToken: string;
    device: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
}

export class SessionRepository {
    private repo: Repository<Session>;

    constructor() {
        this.repo = AppDataSource.getRepository(Session);
    }

    async create(data: CreateSessionData): Promise<Session> {
        const session = this.repo.create({
            userId: data.userId,
            refreshToken: data.refreshToken,
            device: data.device,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            expiresAt: data.expiresAt,
            revoked: false,
        });
        return await this.repo.save(session);
    }

    async findById(id: string): Promise<Session | null> {
        return await this.repo.findOne({ where: { id } });
    }

    async findByUserIdAndDevice(
        userId: string,
        device: string,
        ipAddress: string,
        userAgent: string
    ): Promise<Session | null> {
        return await this.repo.findOne({
            where: {
                userId,
                device,
                ipAddress,
                userAgent,
                revoked: false,
            },
        });
    }

    async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
        return await this.repo.find({
            where: {
                userId,
                revoked: false,
            },
            order: {
                createdAt: "DESC",
            },
        });
    }

    async findByRefreshToken(refreshToken: string): Promise<Session | null> {
        return await this.repo.findOne({
            where: {
                refreshToken,
                revoked: false,
            },
        });
    }

    async revokeSession(sessionId: string): Promise<void> {
        await this.repo.update(sessionId, { revoked: true });
    }

    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.repo.update({ userId }, { revoked: true });
    }

    async deleteSession(sessionId: string): Promise<void> {
        await this.repo.delete(sessionId);
    }

    async deleteByUserIdAndDevice(
        userId: string,
        device: string,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        await this.repo.delete({
            userId,
            device,
            ipAddress,
            userAgent,
        });
    }

    async updateRefreshToken(
        sessionId: string,
        refreshToken: string,
        expiresAt: Date
    ): Promise<void> {
        await this.repo.update(sessionId, {
            refreshToken,
            expiresAt,
        });
    }

    async cleanExpiredSessions(): Promise<number> {
        const result = await this.repo
            .createQueryBuilder()
            .delete()
            .where("expires_at < :now", { now: new Date() })
            .execute();
        return result.affected || 0;
    }
}
