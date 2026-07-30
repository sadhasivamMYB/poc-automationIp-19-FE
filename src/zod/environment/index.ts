import { z } from "zod";

export const environmentSchema = z.object({
    VITE_BACKEND_URL: z.string().url("VITE_BACKEND_URL must be a valid URL"),
});

export type Environment = z.infer<typeof environmentSchema>;

export const validateEnvironment = () => {
    const parsed = environmentSchema.safeParse(import.meta.env);
    
    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.format());
        throw new Error("Invalid environment variables");
    }
    
    return parsed.data;
};
