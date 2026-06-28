import { z } from "zod";

export const registerSchema = z.object({

    name: z
        .string()
        .min(2, "Name is required")
        .max(30, "Maximum 30 characters"),

    email: z
        .email("Invalid email"),

    password: z
        .string()
        .min(6, "Password must contain at least 6 characters")
        .max(20, "Password too long")
});