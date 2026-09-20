import { z } from "zod";

export const InventoryStatus = z.enum(["IN_STOCK", "OUT_OF_STOCK", "PENDING"]);

export type InventoryStatus = z.infer<typeof InventoryStatus>;

export const InventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  location: z.string().optional(),
  status: InventoryStatus.default("IN_STOCK"),
});

export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;
