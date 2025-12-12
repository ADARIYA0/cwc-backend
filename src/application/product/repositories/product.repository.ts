import { Repository } from "typeorm";
import { Product } from "../../../infrastructure/database/typeorm/entities/Product";
import { AppDataSource } from "../../../infrastructure/database/typeorm/data-source";
import { ProductCategory } from "../../../domain/enums/ProductCategory";

export class ProductRepository {
    private repo: Repository<Product>;

    constructor() {
        this.repo = AppDataSource.getRepository(Product);
    }

    async findById(id: string): Promise<Product | null> {
        return await this.repo.findOne({
            where: { id },
            relations: ["subCategory", "store"],
        });
    }

    async findByStoreId(storeId: string): Promise<Product[]> {
        return await this.repo.find({
            where: { storeId },
            relations: ["subCategory", "store"],
            order: { createdAt: "DESC" },
        });
    }

    async findAll(): Promise<Product[]> {
        return await this.repo.find({
            relations: ["subCategory", "store"],
            order: { createdAt: "DESC" },
        });
    }

    async findByCategory(category: ProductCategory): Promise<Product[]> {
        return await this.repo.find({
            where: { category },
            relations: ["subCategory", "store"],
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
