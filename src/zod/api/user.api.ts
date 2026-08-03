import { z } from "zod";
import { createApiResponseSchema } from "../common";
export const userRoleSchema = z.enum(["ADMIN", "USER"]);

export const userSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: userRoleSchema,
    status: z.string().optional(),
    warehouseId: z.coerce.number().optional().nullable(),
    createdAt: z.string().optional(),
    warehouseName: z.string().optional().nullable(),
    warehouse: z.object({
        warehouseName: z.string()
    }).optional().nullable(),
});

export const userFormSchema = z.object({
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: userRoleSchema,
    warehouseId: z.coerce.number().optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.role === 'USER' && !data.warehouseId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Warehouse is required for USER role",
            path: ["warehouseId"]
        });
    }
});

export const userResponseSchema = createApiResponseSchema(userSchema);
export const usersListResponseSchema = createApiResponseSchema(z.array(userSchema));

export type User = z.infer<typeof userSchema>;
export type UserFormValues = z.infer<typeof userFormSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
