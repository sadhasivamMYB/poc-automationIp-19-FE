import { z } from "zod";
import { createApiResponseSchema } from "../common";

export const compareItemSchema = z.object({
    itemId: z.coerce.number(),
    systemStock: z.coerce.number(),
    physicalStock: z.coerce.number(),
    variance: z.coerce.number(),
    remarks: z.string().optional().nullable(),
});

export const compareBulkPayloadSchema = z.object({
    warehouseId: z.coerce.number(),
    date: z.string(),
    comparisons: z.array(compareItemSchema)
});

export const compareResponseSchema = createApiResponseSchema(z.array(compareItemSchema));

export type CompareItem = z.infer<typeof compareItemSchema>;
export type CompareBulkPayload = z.infer<typeof compareBulkPayloadSchema>;
