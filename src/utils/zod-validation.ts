import { z } from "zod";

/**
 * Validates an API response against a Zod schema.
 * Throws a formatted error if validation fails.
 */
export const parseApiResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ API Response Validation Failed:", formatZodErrors(error));
        }
        throw error;
    }
};

/**
 * Safely validates an API response without throwing an error.
 * Returns an object indicating success or failure.
 */
export const safeParseResponse = <T>(
    schema: z.ZodType<T>,
    data: unknown
) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error("❌ API Response Validation Failed:", formatZodErrors(result.error));
    }
    return result;
};

/**
 * Formats Zod errors into a readable string format.
 */
export const formatZodErrors = (error: z.ZodError<any>): string => {
    return error.issues
        .map((e: any) => `Path [${e.path.join(".")}] - ${e.message}`)
        .join("\n");
};
