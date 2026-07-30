import { z } from "zod";
import { createApiResponseSchema } from "../common";

export const summaryDataSchema = z.object({
    itemCode: z.string(),
    itemName: z.string(),
    totalReceived: z.coerce.number(), // raw bottles
    totalIssued: z.coerce.number(),   // raw bottles
});

export const dashboardStatsSchema = z.object({
    totalWarehouses: z.coerce.number().default(0),
    totalItems: z.coerce.number().default(0),
    totalUsers: z.coerce.number().default(0),
    totalTransactions: z.coerce.number().default(0),
});

export const summaryResponseSchema = createApiResponseSchema(z.array(summaryDataSchema));
export const dashboardStatsResponseSchema = createApiResponseSchema(dashboardStatsSchema);

export type SummaryData = z.infer<typeof summaryDataSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
