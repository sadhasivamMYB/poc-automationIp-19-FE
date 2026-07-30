import { z } from "zod";
import { createApiResponseSchema } from "../common";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const microsoftAuthSchema = z.object({
    idToken: z.string().min(1, "ID Token is required"),
});

export const authResponseDataSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.union([z.string(), z.number()]),
        fullName: z.string(),
        email: z.string(),
        password: z.string().optional(),
        role: z.enum(["ADMIN", "USER"]),
        warehouseId: z.coerce.number().optional().nullable(),
        warehouseName: z.string().optional().nullable(),
        createdAt: z.string().optional(),
    })
});

export const authResponseSchema = createApiResponseSchema(authResponseDataSchema);

export type LoginPayload = z.infer<typeof loginSchema>;
export type MicrosoftAuthPayload = z.infer<typeof microsoftAuthSchema>;
export type AuthResponseData = z.infer<typeof authResponseDataSchema>;
