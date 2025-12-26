// lib/validation.ts
import { z } from "zod";

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

  // Infer the TS type for type-safety
export type CategoryInput = z.infer<typeof categorySchema>;

// MenuItem
export const menuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.number().int(),
});

// InventoryLog
export const inventoryLogSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int(),
  changeType: z.enum(["INCREASE", "DECREASE"]),
});

// Order (Basic)
export const orderSchema = z.object({
  tableNumber: z.number().int().positive(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
});

// Order Composite (For creating Order + Items + Payment in one go)
export const createOrderCompositeSchema = z.object({
  tableNumber: z.number().int().positive("Table number required"),
  items: z.array(
    z.object({
      menuItemId: z.number().int(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must have at least one item"),
  paymentMethod: z.enum(["CASH", "MOBILE_BANKING"]).optional(),
});


// OrderItem
export const orderItemSchema = z.object({
  orderId: z.number().int(),
  menuItemId: z.number().int(),
  quantity: z.number().int().positive(),
});

// Payment
export const paymentSchema = z.object({
  orderId: z.number().int(),
  amount: z.number().positive(),
  method: z.enum(["CASH", "MOBILE_BANKING"]),
  transactionRef: z.string().optional(),
});