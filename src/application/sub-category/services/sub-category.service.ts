import { SubCategoryRepository } from "../repositories/sub-category.repository";
import { StoreRepository } from "../../store/repositories/store.repository";
import { CreateSubCategoryDTO, UpdateSubCategoryDTO, SubCategoryResponseDTO } from "../dto/sub-category.dto";
import logger from "../../../infrastructure/logging/logger";

export class SubCategoryService {
    constructor(
        private readonly subCategoryRepo: SubCategoryRepository,
        private readonly storeRepo: StoreRepository
    ) { }

    /**
     * Capitalize first letter of each word
     */
    private capitalizeWords(str: string): string {
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    async createSubCategory(userId: string, dto: CreateSubCategoryDTO): Promise<SubCategoryResponseDTO> {
        // Get user's store
        const store = await this.storeRepo.findByUserId(userId);
        if (!store) {
            throw new Error("STORE_NOT_FOUND");
        }

        // Capitalize the name
        const capitalizedName = this.capitalizeWords(dto.name.trim());

        // Check for duplicate name (case-insensitive)
        const existing = await this.subCategoryRepo.findByNameCaseInsensitive(capitalizedName);
        if (existing) {
            throw new Error("DUPLICATE_NAME");
        }

        // Create sub-category
        const subCategory = await this.subCategoryRepo.createAndSave({
            storeId: store.id,
            name: capitalizedName,
        });

        logger.info(`Sub-category created by store ${store.id}: ${subCategory.id}`);

        return {
            id: subCategory.id,
            storeId: subCategory.storeId,
            name: subCategory.name,
            isOwner: true,
            createdAt: subCategory.createdAt,
            updatedAt: subCategory.updatedAt,
        };
    }

    async updateSubCategory(userId: string, subCategoryId: string, dto: UpdateSubCategoryDTO): Promise<SubCategoryResponseDTO> {
        // Get user's store
        const store = await this.storeRepo.findByUserId(userId);
        if (!store) {
            throw new Error("STORE_NOT_FOUND");
        }

        // Get sub-category
        const subCategory = await this.subCategoryRepo.findById(subCategoryId);
        if (!subCategory) {
            throw new Error("SUB_CATEGORY_NOT_FOUND");
        }

        // Check ownership
        if (subCategory.storeId !== store.id) {
            logger.warn(`Store ${store.id} attempted to edit sub-category ${subCategoryId} owned by store ${subCategory.storeId}`);
            throw new Error("NOT_OWNER");
        }

        // Capitalize the name
        const capitalizedName = this.capitalizeWords(dto.name.trim());

        // Check for duplicate name (case-insensitive), excluding current
        const existing = await this.subCategoryRepo.findByNameCaseInsensitive(capitalizedName);
        if (existing && existing.id !== subCategoryId) {
            throw new Error("DUPLICATE_NAME");
        }

        // Update
        const updated = await this.subCategoryRepo.update(subCategoryId, {
            name: capitalizedName,
        });

        if (!updated) {
            throw new Error("UPDATE_FAILED");
        }

        logger.info(`Sub-category updated by store ${store.id}: ${subCategoryId}`);

        return {
            id: updated.id,
            storeId: updated.storeId,
            name: updated.name,
            isOwner: true,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }

    async getAllSubCategories(userId?: string): Promise<SubCategoryResponseDTO[]> {
        const subCategories = await this.subCategoryRepo.findAll();

        let userStoreId: string | null = null;
        if (userId) {
            const store = await this.storeRepo.findByUserId(userId);
            userStoreId = store?.id || null;
        }

        return subCategories.map(sc => ({
            id: sc.id,
            storeId: sc.storeId,
            name: sc.name,
            isOwner: userStoreId ? sc.storeId === userStoreId : false,
            createdAt: sc.createdAt,
            updatedAt: sc.updatedAt,
        }));
    }

    async getMySubCategories(userId: string): Promise<SubCategoryResponseDTO[]> {
        const store = await this.storeRepo.findByUserId(userId);
        if (!store) {
            throw new Error("STORE_NOT_FOUND");
        }

        const subCategories = await this.subCategoryRepo.findByStoreId(store.id);

        return subCategories.map(sc => ({
            id: sc.id,
            storeId: sc.storeId,
            name: sc.name,
            isOwner: true,
            createdAt: sc.createdAt,
            updatedAt: sc.updatedAt,
        }));
    }
}
