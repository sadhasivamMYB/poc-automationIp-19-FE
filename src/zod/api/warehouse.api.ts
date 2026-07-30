import { z } from "zod";
import { createApiResponseSchema } from "../common";

export const warehouseSchema = z.object({
    id: z.coerce.number(),
    warehouseCode: z.string().optional().nullable(),
    warehouseName: z.string(),
    location: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});

export const warehouseResponseSchema = createApiResponseSchema(warehouseSchema);
export const warehouseListResponseSchema = createApiResponseSchema(z.array(warehouseSchema));

export type Warehouse = z.infer<typeof warehouseSchema>;
