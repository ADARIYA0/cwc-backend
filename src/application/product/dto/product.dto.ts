import { ProductCategory } from "../../../domain/enums/ProductCategory";
import { WeightUnit } from "../../../domain/enums/WeightUnit";

export interface CreateProductDTO {
    name: string;
    description: string | undefined;
    category: ProductCategory;
    subCategoryId: string;
    price: number;
    priceUnit: WeightUnit;
    priceUnitAmount: number;
    stock: number;
    stockUnit: WeightUnit;
    imagePath: string;
}

export interface ProductResponseDTO {
    id: string;
    userId: string;
    name: string;
    description: string | undefined;
    category: ProductCategory;
    subCategoryId: string;
    subCategoryName: string | undefined;
    price: number;
    priceUnit: WeightUnit;
    priceUnitAmount: number;
    stock: number;
    stockUnit: WeightUnit;
    imagePath: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
