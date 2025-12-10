import { Request, Response } from "express";
import { SubCategoryService } from "../../../../application/sub-category/services/sub-category.service";
import { SubCategoryRepository } from "../../../../application/sub-category/repositories/sub-category.repository";
import { StoreRepository } from "../../../../application/store/repositories/store.repository";
import { createSubCategorySchema, updateSubCategorySchema } from "../../../../application/sub-category/validators/sub-category.validator";
import logger from "../../../../infrastructure/logging/logger";

const subCategoryRepo = new SubCategoryRepository();
const storeRepo = new StoreRepository();
const subCategoryService = new SubCategoryService(subCategoryRepo, storeRepo);

export async function createSubCategoryHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const parseResult = createSubCategorySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parseResult.error.flatten(),
            });
        }

        const subCategory = await subCategoryService.createSubCategory(userId, parseResult.data);

        return res.status(201).json({
            message: "Sub-category created successfully",
            data: subCategory,
        });
    } catch (err: any) {
        if (err.message === "STORE_NOT_FOUND") {
            return res.status(403).json({
                error: "STORE_NOT_FOUND",
                message: "You need to open a store first.",
            });
        }

        if (err.message === "DUPLICATE_NAME") {
            return res.status(409).json({
                error: "DUPLICATE_NAME",
                message: "Sub-category with this name already exists.",
            });
        }

        logger.error("Create sub-category failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function updateSubCategoryHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                error: "MISSING_ID",
                message: "Sub-category ID is required",
            });
        }

        const parseResult = updateSubCategorySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parseResult.error.flatten(),
            });
        }

        const subCategory = await subCategoryService.updateSubCategory(userId, id, parseResult.data);

        return res.status(200).json({
            message: "Sub-category updated successfully",
            data: subCategory,
        });
    } catch (err: any) {
        if (err.message === "STORE_NOT_FOUND") {
            return res.status(403).json({
                error: "STORE_NOT_FOUND",
                message: "You need to open a store first.",
            });
        }

        if (err.message === "SUB_CATEGORY_NOT_FOUND") {
            return res.status(404).json({
                error: "SUB_CATEGORY_NOT_FOUND",
                message: "Sub-category not found.",
            });
        }

        if (err.message === "NOT_OWNER") {
            return res.status(403).json({
                error: "NOT_OWNER",
                message: "You can only edit your own sub-categories.",
            });
        }

        if (err.message === "DUPLICATE_NAME") {
            return res.status(409).json({
                error: "DUPLICATE_NAME",
                message: "Sub-category with this name already exists.",
            });
        }

        logger.error("Update sub-category failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getAllSubCategoriesHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id; // optional, for isOwner flag
        const subCategories = await subCategoryService.getAllSubCategories(userId);

        return res.status(200).json({
            message: "Sub-categories retrieved successfully",
            data: subCategories,
        });
    } catch (err: any) {
        logger.error("Get all sub-categories failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getMySubCategoriesHandler(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        const subCategories = await subCategoryService.getMySubCategories(userId);

        return res.status(200).json({
            message: "Sub-categories retrieved successfully",
            data: subCategories,
        });
    } catch (err: any) {
        if (err.message === "STORE_NOT_FOUND") {
            return res.status(403).json({
                error: "STORE_NOT_FOUND",
                message: "You need to open a store first.",
            });
        }

        logger.error("Get my sub-categories failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
