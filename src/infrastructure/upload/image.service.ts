import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { PRODUCT_UPLOAD_DIR } from "./upload.config";
import logger from "../logging/logger";

const BASE_URL = process.env.UPLOADS_BASE_URL;

export class ImageService {
    static async compressImage(filename: string): Promise<void> {
        const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
        const tempPath = path.join(PRODUCT_UPLOAD_DIR, `temp_${filename}`);

        try {
            const ext = path.extname(filename).toLowerCase();

            let sharpInstance = sharp(filepath);

            if (ext === ".jpg" || ext === ".jpeg") {
                sharpInstance = sharpInstance.jpeg({ quality: 80 });
            } else if (ext === ".png") {
                sharpInstance = sharpInstance.png({ quality: 80 });
            } else if (ext === ".webp") {
                sharpInstance = sharpInstance.webp({ quality: 80 });
            }

            await sharpInstance.toFile(tempPath);

            await fs.unlink(filepath);
            await fs.rename(tempPath, filepath);

            logger.info(`Compressed image: ${filename}`);
        } catch (error) {
            try {
                await fs.unlink(tempPath);
            } catch {
            }
            logger.error(`Failed to compress image: ${filename}`, error);
            throw error;
        }
    }

    static getImageUrl(filename: string): string {
        return `${BASE_URL}/products/${filename}`;
    }

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
