import { Request, Response } from "express";
import { registerSchema } from "../../../../application/auth/validators/register.validator";
import { UserRepository } from "../../../../application/auth/repositories/user.repository";
import { RegisterService } from "../../../../application/auth/services/register.service";
import logger from "../../../../infrastructure/logging/logger";

const userRepo = new UserRepository();
const registerService = new RegisterService(userRepo);

export async function registerHandler(req: Request, res: Response) {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parseResult.error.flatten() });
        }

        const dto = parseResult.data;

        const user = await registerService.register(dto);

        return res.status(201).json({
            message: "User created",
            data: user
        });
    } catch (err: any) {
        if (err.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
        }

        logger.error("Registration failed:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
