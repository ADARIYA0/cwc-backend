import { Router } from "express";
import {
    createProductHandler,
    getMyProductsHandler,
    getAllProductsHandler,
    handleMulterError,
} from "../controllers/product.controller";
import { authenticate } from "../../../../middlewares/auth.middleware";
import { productImageUpload } from "../../../../infrastructure/upload/upload.config";

const router = Router();

// POST /api/products - Create product (authenticated, seller only)
router.post(
    "/",
    authenticate,
    productImageUpload.single("image"),
    handleMulterError,
    createProductHandler
);

// GET /api/products/my-products - Get seller's own products (authenticated)
router.get("/my-products", authenticate, getMyProductsHandler);

// GET /api/products - Get all products (public)
router.get("/", getAllProductsHandler);

export default router;
