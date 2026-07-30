import { z } from "zod";
import { createApiResponseSchema } from "../common";
import { masterItemSchema } from "./master-item.api";

export const dailyStockSchema = z.object({
    id: z.coerce.number().optional(),
    warehouseId: z.coerce.number(),
    itemId: z.coerce.number(),
    receiptCases: z.coerce.number().min(0).default(0),
    receiptLoose: z.coerce.number().min(0).default(0),
    issueCases: z.coerce.number().min(0).default(0),
    issueLoose: z.coerce.number().min(0).default(0),
    date: z.string().optional(),
    item: masterItemSchema.optional(),
});

export const dailyStockBulkPayloadSchema = z.object({
    warehouseId: z.coerce.number(),
    date: z.string(),
    items: z.array(z.object({
        itemId: z.coerce.number(),
        receiptCases: z.coerce.number().min(0).default(0),
        receiptLoose: z.coerce.number().min(0).default(0),
        issueCases: z.coerce.number().min(0).default(0),
        issueLoose: z.coerce.number().min(0).default(0),
    }))
});

export const dailyStockResponseSchema = createApiResponseSchema(dailyStockSchema);
export const dailyStockListResponseSchema = createApiResponseSchema(z.array(dailyStockSchema));

export type DailyStock = z.infer<typeof dailyStockSchema>;
export type DailyStockBulkPayload = z.infer<typeof dailyStockBulkPayloadSchema>;
