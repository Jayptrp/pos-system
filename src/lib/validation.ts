// lib/validation.ts
import { z } from "zod";

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
});

// Infer the TS type for type-safety
export type CategoryInput = z.infer<typeof categorySchema>;

// MenuItem
export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  price: z.number().positive("Price must be positive").max(99999, "Price too high"),
  categoryId: z.number().int("Category ID must be an integer").positive(),
});

// InventoryLog
export const inventoryLogSchema = z.object({
  itemName: z.string().min(1, "Item name is required").max(100, "Item name too long").trim(),
  quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
  changeType: z.enum(["INCREASE", "DECREASE"]),
});

// Order (Basic)
export const orderSchema = z.object({
  tableNumber: z.number().int().positive("Table number must be positive"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
});

// Order Composite (For creating Order + Items + Payment in one go)
export const createOrderCompositeSchema = z.object({
  tableNumber: z.number().int().positive("Table number required"),
  items: z.array(
    z.object({
      menuItemId: z.number().int().positive(),
      quantity: z.number().int().positive("Quantity must be at least 1"),
    })
  ).min(1, "Order must have at least one item"),
  paymentMethod: z.enum(["CASH", "MOBILE_BANKING"]).optional(),
});

// OrderItem
export const orderItemSchema = z.object({
  orderId: z.number().int().positive(),
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

// Payment
export const paymentSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().positive("Amount must be positive").max(999999, "Amount too high"),
  method: z.enum(["CASH", "MOBILE_BANKING"]),
  transactionRef: z.string().max(100, "Reference too long").optional().nullable(),
});