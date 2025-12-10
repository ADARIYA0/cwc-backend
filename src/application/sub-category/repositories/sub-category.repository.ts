import { Repository } from "typeorm";
import { SubCategory } from "../../../infrastructure/database/typeorm/entities/SubCategory";
import { AppDataSource } from "../../../infrastructure/database/typeorm/data-source";

export class SubCategoryRepository {
    private repo: Repository<SubCategory>;

    constructor() {
        this.repo = AppDataSource.getRepository(SubCategory);
    }

    async findById(id: string): Promise<SubCategory | null> {
        return await this.repo.findOne({ where: { id } });
    }

    async findByStoreId(storeId: string): Promise<SubCategory[]> {
        return await this.repo.find({
            where: { storeId },
            order: { name: "ASC" },
        });
    }

    async findAll(): Promise<SubCategory[]> {
        return await this.repo.find({
            order: { name: "ASC" },
        });
    }

    async findByNameCaseInsensitive(name: string): Promise<SubCategory | null> {
        return await this.repo
            .createQueryBuilder("sub_category")
            .where("LOWER(sub_category.name) = LOWER(:name)", { name })
            .getOne();
    }

    async createAndSave(data: Partial<SubCategory>): Promise<SubCategory> {
        const subCategory = this.repo.create(data);
        return await this.repo.save(subCategory);
    }

    async update(id: string, data: Partial<SubCategory>): Promise<SubCategory | null> {
        await this.repo.update(id, data);
        return await this.findById(id);
    }
}
