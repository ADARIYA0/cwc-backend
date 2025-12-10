import { Repository } from "typeorm";
import { Product } from "../../../infrastructure/database/typeorm/entities/Product";
import { AppDataSource } from "../../../infrastructure/database/typeorm/data-source";

export class ProductRepository {
    private repo: Repository<Product>;

    constructor() {
        this.repo = AppDataSource.getRepository(Product);
    }

    async findById(id: string): Promise<Product | null> {
        return await this.repo.findOne({
            where: { id },
            relations: ["subCategory"],
        });
    }

    async findByUserId(userId: string): Promise<Product[]> {
        return await this.repo.find({
            where: { userId },
            relations: ["subCategory"],
            order: { createdAt: "DESC" },
        });
    }

    async findAll(): Promise<Product[]> {
        return await this.repo.find({
            relations: ["subCategory"],
            order: { createdAt: "DESC" },
        });
    }

    async createAndSave(productData: Partial<Product>): Promise<Product> {
        const product = this.repo.create(productData);
        const saved = await this.repo.save(product);
        // Reload with relations
        return await this.findById(saved.id) as Product;
    }
}
