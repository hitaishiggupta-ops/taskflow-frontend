import { z } from "zod";

export const boardSchema = z.object({

    title: z
        .string()
        .min(3, "Board title required")
        .max(50, "Maximum 50 characters"),

    description: z
        .string()
        .min(3, "Description required")
        .max(200, "Maximum 200 characters"),

    assignedUserId: z
    .string()
    .optional(),

    trdFile: z.any().optional(),
    brdFile: z.any().optional(),
    prdFile: z.any().optional(),    
});