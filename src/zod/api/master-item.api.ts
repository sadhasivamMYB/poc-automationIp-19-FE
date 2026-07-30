import { z } from "zod";
import { createApiResponseSchema } from "../common";

export const masterItemSchema = z.object({
    id: z.coerce.number(),
    itemCode: z.string().min(1, "Item Code is required"),
    itemName: z.string().min(1, "Item Name is required"),
    bottlePerCase: z.coerce.number().min(1, "Must be at least 1"),
    isActive: z.boolean().default(true),
});

export const masterItemFormSchema = z.object({
    itemCode: z.string().min(1, "Item Code is required"),
    itemName: z.string().min(1, "Item Name is required"),
    bottlePerCase: z.coerce.number().min(1, "Must be at least 1"),
    isActive: z.boolean().default(true),
});

export const masterItemResponseSchema = createApiResponseSchema(masterItemSchema);
export const masterItemListResponseSchema = createApiResponseSchema(z.array(masterItemSchema));

export type MasterItem = z.infer<typeof masterItemSchema>;
export type MasterItemFormValues = z.infer<typeof masterItemFormSchema>;
