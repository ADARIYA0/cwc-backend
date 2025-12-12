import { ProductRepository } from "../repositories/product.repository";
import { StoreRepository } from "../../store/repositories/store.repository";
import { CreateProductDTO, ProductResponseDTO } from "../dto/product.dto";
import { ImageService } from "../../../infrastructure/upload/image.service";
import logger from "../../../infrastructure/logging/logger";
import { ProductCategory } from "../../../domain/enums/ProductCategory";

export class ProductService {
    constructor(
        private readonly productRepo: ProductRepository,
        private readonly storeRepo: StoreRepository
    ) { }

    async createProduct(userId: string, dto: CreateProductDTO): Promise<ProductResponseDTO> {
        // Find store by userId
        const store = await this.storeRepo.findByUserId(userId);
        if (!store) {
            throw new Error("STORE_NOT_FOUND");
        }

        const productData: Partial<import("../../../infrastructure/database/typeorm/entities/Product").Product> = {
            storeId: store.id,
            name: dto.name.trim(),
            category: dto.category,
            subCategoryId: dto.subCategoryId,
            price: dto.price,
            priceUnit: dto.priceUnit,
            priceUnitAmount: dto.priceUnitAmount,
            stock: dto.stock,
            stockUnit: dto.stockUnit,
            imagePath: dto.imagePath,
        };

        if (dto.description) {
            productData.description = dto.description.trim();
        }

        const product = await this.productRepo.createAndSave(productData);

        logger.info(`Product created by store ${store.id}: ${product.id}`);

        return this.mapToDTO(product);
    }

    async getProductsByUser(userId: string): Promise<ProductResponseDTO[]> {
        // Find store by userId first
        const store = await this.storeRepo.findByUserId(userId);
        if (!store) {
            return [];
        }

        const products = await this.productRepo.findByStoreId(store.id);
        return products.map(product => this.mapToDTO(product));
    }

    async getAllProducts(category?: ProductCategory): Promise<ProductResponseDTO[]> {
        const products = category
            ? await this.productRepo.findByCategory(category)
            : await this.productRepo.findAll();

        return products.map(product => this.mapToDTO(product));
    }

    private mapToDTO(product: any): ProductResponseDTO {
        return {
            id: product.id,
            storeId: product.storeId,
            storeName: product.store?.name || "Unknown Store",
            name: product.name,
            description: product.description,
            category: product.category,
            subCategoryId: product.subCategoryId,
            subCategoryName: product.subCategory?.name,
            price: product.price,
            priceUnit: product.priceUnit,
            priceUnitAmount: product.priceUnitAmount,
            stock: product.stock,
            stockUnit: product.stockUnit,
            imagePath: product.imagePath,
            imageUrl: ImageService.getImageUrl(product.imagePath),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
