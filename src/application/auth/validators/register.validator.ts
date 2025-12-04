import { z } from "zod";
import { UserAccountType } from "../../../domain/user/enums/account-type";

export const registerSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string(),
    accountType: z.enum(UserAccountType),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Password confirmation does not match",
    path: ["passwordConfirm"]
});
