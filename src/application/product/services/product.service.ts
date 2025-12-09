import { ProductRepository } from "../repositories/product.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { CreateProductDTO, ProductResponseDTO } from "../dto/product.dto";
import { UserAccountType } from "../../../domain/enums/UserAccountType";
import { ImageService } from "../../../infrastructure/upload/image.service";
import logger from "../../../infrastructure/logging/logger";

export class ProductService {
    constructor(
        private readonly productRepo: ProductRepository,
        private readonly userRepo: UserRepository
    ) { }

    async createProduct(userId: string, dto: CreateProductDTO): Promise<ProductResponseDTO> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }

        if (user.accountType !== UserAccountType.PENJUAL) {
            logger.warn(`Non-seller user ${userId} attempted to create product`);
            throw new Error("SELLER_ONLY");
        }

        const productData: {
            userId: string;
            name: string;
            category: typeof dto.category;
            price: number;
            priceUnit: typeof dto.priceUnit;
            priceUnitAmount: number;
            stock: number;
            stockUnit: typeof dto.stockUnit;
            imagePath: string;
            description?: string;
        } = {
            userId,
            name: dto.name.trim(),
            category: dto.category,
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

        logger.info(`Product created by user ${userId}: ${product.id}`);

        return {
            id: product.id,
            userId: product.userId,
            name: product.name,
            description: product.description,
            category: product.category,
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

    async getProductsByUser(userId: string): Promise<ProductResponseDTO[]> {
        const products = await this.productRepo.findByUserId(userId);

        return products.map((product) => ({
            id: product.id,
            userId: product.userId,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            priceUnit: product.priceUnit,
            priceUnitAmount: product.priceUnitAmount,
            stock: product.stock,
            stockUnit: product.stockUnit,
            imagePath: product.imagePath,
            imageUrl: ImageService.getImageUrl(product.imagePath),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));
    }

    async getAllProducts(): Promise<ProductResponseDTO[]> {
        const products = await this.productRepo.findAll();

        return products.map((product) => ({
            id: product.id,
            userId: product.userId,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            priceUnit: product.priceUnit,
            priceUnitAmount: product.priceUnitAmount,
            stock: product.stock,
            stockUnit: product.stockUnit,
            imagePath: product.imagePath,
            imageUrl: ImageService.getImageUrl(product.imagePath),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));
    }
}
