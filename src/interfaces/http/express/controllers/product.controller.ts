import { Request, Response, NextFunction } from "express";
import { ProductService } from "../../../../application/product/services/product.service";
import { ProductRepository } from "../../../../application/product/repositories/product.repository";
import { UserRepository } from "../../../../application/user/repositories/user.repository";
import { createProductSchema } from "../../../../application/product/validators/product.validator";
import { ImageService } from "../../../../infrastructure/upload/image.service";
import logger from "../../../../infrastructure/logging/logger";
import fs from "fs/promises";
import path from "path";
import { PRODUCT_UPLOAD_DIR } from "../../../../infrastructure/upload/upload.config";

const productRepo = new ProductRepository();
const userRepo = new UserRepository();
const productService = new ProductService(productRepo, userRepo);

export async function createProductHandler(req: Request, res: Response) {
    // Cast to access multer's file property
    const file = (req as any).file as Express.Multer.File | undefined;
    
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        // Check if file was uploaded
        if (!file) {
            return res.status(400).json({
                error: "IMAGE_REQUIRED",
                message: "Product image is required",
            });
        }

        // Validate request body
        const parseResult = createProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            // Delete uploaded file if validation fails
            await deleteUploadedFile(file.filename);
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parseResult.error.flatten(),
            });
        }

        // Compress the image to 80% quality
        try {
            await ImageService.compressImage(file.filename);
        } catch (compressError) {
            logger.error("Image compression failed", compressError);
            // Continue without compression if it fails
        }

        // Create product DTO
        const dto = {
            name: parseResult.data.name,
            description: parseResult.data.description ?? undefined,
            category: parseResult.data.category,
            price: parseResult.data.price,
            priceUnit: parseResult.data.priceUnit,
            priceUnitAmount: parseResult.data.priceUnitAmount,
            stock: parseResult.data.stock,
            stockUnit: parseResult.data.stockUnit,
            imagePath: file.filename,
        };

        const product = await productService.createProduct(userId, dto);

        return res.status(201).json({
            message: "Product created successfully",
            data: product,
        });
    } catch (err: any) {
        // Delete uploaded file on error
        if (file) {
            await deleteUploadedFile(file.filename);
        }

        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                error: "USER_NOT_FOUND",
                message: "User not found",
            });
        }

        if (err.message === "SELLER_ONLY") {
            return res.status(403).json({
                error: "SELLER_ONLY",
                message: "Only sellers can create products. Please open a store first.",
            });
        }

        logger.error("Create product failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getMyProductsHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const products = await productService.getProductsByUser(userId);

        return res.status(200).json({
            message: "Products retrieved successfully",
            data: products,
        });
    } catch (err: any) {
        logger.error("Get my products failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getAllProductsHandler(req: Request, res: Response) {
    try {
        const products = await productService.getAllProducts();

        return res.status(200).json({
            message: "Products retrieved successfully",
            data: products,
        });
    } catch (err: any) {
        logger.error("Get all products failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

// Helper function to delete uploaded file
async function deleteUploadedFile(filename: string): Promise<void> {
    try {
        const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
        await fs.unlink(filepath);
    } catch {
        // Ignore deletion errors
    }
}

// Multer error handler middleware
export function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
    if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "FILE_TOO_LARGE",
                message: "File size exceeds 5MB limit",
            });
        }

        if (err.message === "INVALID_FILE_TYPE" || err.message === "INVALID_FILE_EXTENSION") {
            return res.status(400).json({
                error: "INVALID_FILE_TYPE",
                message: "Only JPG, JPEG, PNG, and WebP images are allowed",
            });
        }

        logger.error("Multer error:", err);
        return res.status(400).json({
            error: "UPLOAD_ERROR",
            message: "Failed to upload file",
        });
    }
    next();
}
