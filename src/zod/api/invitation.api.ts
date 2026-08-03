import { z } from "zod";

export const inviteUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.string().min(1, "Role is required"),
    fullName: z.string().optional(),
    warehouseId: z.number().optional(),
});

export const activateAccountSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});

export type InviteUserRequest = z.infer<typeof inviteUserSchema>;
export type ActivateAccountRequest = z.infer<typeof activateAccountSchema>;
