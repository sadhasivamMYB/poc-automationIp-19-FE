import { z } from "zod";
import { userSchema } from "../api/user.api";

export const localStorageSchema = z.object({
    token: z.string().optional().nullable(),
    user: userSchema.optional().nullable(),
});

export const getValidatedLocalStorage = () => {
    try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        
        const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
        
        return localStorageSchema.parse({
            token,
            user
        });
    } catch (error) {
        console.error("Local storage validation failed", error);
        return { token: null, user: null };
    }
};
