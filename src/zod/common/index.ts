import { z } from "zod";

// Base Pagination Schema
export const paginationSchema = z.object({
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
    total: z.number().int().min(0).optional(),
});

// Reusable Types
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const stringOrNumber = z.union([z.string(), z.number()]);

// Common API Response Wrappers
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
    return z.object({
        success: z.boolean().optional(),
        message: z.string().optional(),
        data: dataSchema,
        errors: z.array(z.string()).optional(),
        meta: z.object({
            pagination: paginationSchema.optional()
        }).optional(),
    });
};

export const apiErrorResponseSchema = z.object({
    success: z.boolean().optional(),
    message: z.string(),
    errors: z.array(z.string()).optional(),
});
