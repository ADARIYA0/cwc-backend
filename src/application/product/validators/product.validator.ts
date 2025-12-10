import { z } from "zod";
import { ProductCategory } from "../../../domain/enums/ProductCategory";
import { WeightUnit } from "../../../domain/enums/WeightUnit";

export const createProductSchema = z.object({
    name: z.string()
        .min(3, "Product name must be at least 3 characters")
        .max(255, "Product name must not exceed 255 characters"),
    description: z.string()
        .max(2000, "Description must not exceed 2000 characters")
        .optional(),
    category: z.enum([ProductCategory.KERAJINAN, ProductCategory.BAHAN_BAKU]),
    subCategoryId: z.string().uuid("Invalid sub-category ID").optional(),
    price: z.coerce.number()
        .int("Price must be an integer")
        .positive("Price must be positive"),
    priceUnit: z.enum([WeightUnit.GRAM, WeightUnit.KILOGRAM]).default(WeightUnit.KILOGRAM),
    priceUnitAmount: z.coerce.number()
        .int("Price unit amount must be an integer")
        .positive("Price unit amount must be positive")
        .default(1),
    stock: z.coerce.number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative"),
    stockUnit: z.enum([WeightUnit.GRAM, WeightUnit.KILOGRAM]).default(WeightUnit.KILOGRAM),
});

