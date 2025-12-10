import { z } from "zod";

export const createSubCategorySchema = z.object({
    name: z.string()
        .min(2, "Sub-category name must be at least 2 characters")
        .max(100, "Sub-category name must not exceed 100 characters")
        .regex(/^[a-zA-Z0-9\s\-&]+$/, "Sub-category name can only contain letters, numbers, spaces, hyphens, and ampersands"),
});

export const updateSubCategorySchema = z.object({
    name: z.string()
        .min(2, "Sub-category name must be at least 2 characters")
        .max(100, "Sub-category name must not exceed 100 characters")
        .regex(/^[a-zA-Z0-9\s\-&]+$/, "Sub-category name can only contain letters, numbers, spaces, hyphens, and ampersands"),
});
