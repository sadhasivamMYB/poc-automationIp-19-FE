import { z } from "zod";
import { createApiResponseSchema } from "../common";
import { masterItemSchema } from "./master-item.api";
import { warehouseSchema } from "./warehouse.api";

export const initialStockSchema = z.object({
    id: z.coerce.number().optional(),
    warehouseId: z.coerce.number(),
    itemId: z.coerce.number(),
    initialStockCases: z.coerce.number().min(0).default(0),
    initialStockLoose: z.coerce.number().min(0).default(0),
    date: z.string().optional(),
    warehouse: warehouseSchema.optional(),
    item: masterItemSchema.optional(),
});

export const initialStockFormSchema = z.object({
    warehouseId: z.coerce.number().min(1, "Warehouse is required"),
    itemId: z.coerce.number().min(1, "Item is required"),
    openingCases: z.coerce.number().min(0, "Cannot be negative"),
    openingBottles: z.coerce.number().min(0, "Cannot be negative"),
});

export const initialStockResponseSchema = createApiResponseSchema(initialStockSchema);
export const initialStockListResponseSchema = createApiResponseSchema(z.array(initialStockSchema));

export type InitialStock = z.infer<typeof initialStockSchema>;
export type StockFormValues = z.infer<typeof initialStockFormSchema>;
