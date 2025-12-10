import { Router } from "express";
import {
    createSubCategoryHandler,
    updateSubCategoryHandler,
    getAllSubCategoriesHandler,
    getMySubCategoriesHandler,
} from "../controllers/sub-category.controller";
import { authenticate, optionalAuthenticate } from "../../../../middlewares/auth.middleware";

const router = Router();

// GET /api/sub-categories - Get all sub-categories (public, with optional auth for isOwner)
router.get("/", optionalAuthenticate, getAllSubCategoriesHandler);

// GET /api/sub-categories/my-sub-categories - Get seller's own sub-categories (authenticated)
router.get("/my-sub-categories", authenticate, getMySubCategoriesHandler);

// POST /api/sub-categories - Create sub-category (authenticated, seller only)
router.post("/", authenticate, createSubCategoryHandler);

// PUT /api/sub-categories/:id - Update sub-category (authenticated, owner only)
router.put("/:id", authenticate, updateSubCategoryHandler);

export default router;
