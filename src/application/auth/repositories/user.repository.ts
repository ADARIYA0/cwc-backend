import { Repository } from "typeorm";
import { User } from "../../../infrastructure/database/typeorm/entities/User";
import { AppDataSource } from "../../../infrastructure/database/typeorm/data-source";

export class UserRepository {
    private repo: Repository<User>;

    constructor() {
        this.repo = AppDataSource.getRepository(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repo.findOne({ where: { email } });
    }

    async createAndSave(userData: Partial<User>): Promise<User> {
        const user = this.repo.create(userData);
        return await this.repo.save(user);
    }
}
