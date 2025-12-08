import { UserRepository } from "../repositories/user.repository";
import argon2 from "argon2";
import logger from "../../../infrastructure/logging/logger";
import { RegisterDTO } from "../dto/register.dto";
import { User } from "../../../infrastructure/database/typeorm/entities/User";

export class RegisterService {
    constructor(private readonly userRepo: UserRepository) { }

    async register(dto: RegisterDTO): Promise<Pick<User, "id" | "email" | "fullName" | "accountType" | "createdAt">> {
        const existing = await this.userRepo.findByEmail(dto.email.toLowerCase().trim());
        if (existing) {
            logger.warn(`Registration attempt with existing email: ${dto.email}`);
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        const password = await argon2.hash(dto.password);

        const created = await this.userRepo.createAndSave({
            fullName: dto.fullName.trim(),
            email: dto.email.toLowerCase().trim(),
            password,
        });

        logger.info(`User registered: ${created.id}`);

        return {
            id: created.id,
            email: created.email,
            fullName: created.fullName,
            accountType: created.accountType,
            createdAt: created.createdAt
        };
    }
}
