import { z } from "zod";

export const taskSchema = z.object({

  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(100),

  description: z
    .string()
    .optional(),

  priority: z.enum(["low", "medium", "high"]),


  dueDate: z
    .string()
    .optional(),

  estimatedEffort: z
    .string()
    .optional(),


  image: z.any().optional(),
});