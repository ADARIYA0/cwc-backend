import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { PRODUCT_UPLOAD_DIR } from "./upload.config";
import logger from "../logging/logger";

// Base URL for serving images (configure based on your domain)
const BASE_URL = process.env.UPLOADS_BASE_URL || "https://gocycle.my.id/uploads";

export class ImageService {
    /**
     * Compress image to 80% quality and overwrite original
     */
    static async compressImage(filename: string): Promise<void> {
        const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
        const tempPath = path.join(PRODUCT_UPLOAD_DIR, `temp_${filename}`);

        try {
            const ext = path.extname(filename).toLowerCase();

            // Read and compress image
            let sharpInstance = sharp(filepath);

            if (ext === ".jpg" || ext === ".jpeg") {
                sharpInstance = sharpInstance.jpeg({ quality: 80 });
            } else if (ext === ".png") {
                sharpInstance = sharpInstance.png({ quality: 80 });
            } else if (ext === ".webp") {
                sharpInstance = sharpInstance.webp({ quality: 80 });
            }

            // Save to temp file first
            await sharpInstance.toFile(tempPath);

            // Replace original with compressed version
            await fs.unlink(filepath);
            await fs.rename(tempPath, filepath);

            logger.info(`Compressed image: ${filename}`);
        } catch (error) {
            // Clean up temp file if exists
            try {
                await fs.unlink(tempPath);
            } catch {
                // Ignore cleanup errors
            }
            logger.error(`Failed to compress image: ${filename}`, error);
            throw error;
        }
    }

    /**
     * Generate public URL for image
     */
    static getImageUrl(filename: string): string {
        return `${BASE_URL}/products/${filename}`;
    }

    /**
     * Delete image file
     */
    static async deleteImage(filename: string): Promise<void> {
        const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
        try {
            await fs.unlink(filepath);
            logger.info(`Deleted image: ${filename}`);
        } catch (error) {
            logger.error(`Failed to delete image: ${filename}`, error);
        }
    }
}
