// Add this type definition to the top of your hook file
export type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type Role = "ADMIN" | "CASHIER";

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// --- Order Interfaces (Output Data) ---

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  menuItem?: MenuItem;
}

export interface Payment {
  id: number;
  orderId: number;
  method: "CASH" | "MOBILE_BANKING";
  amount: number;
  transactionRef?: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  tableNumber: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  payments: Payment[];
}

// --- Input Payloads ---

export interface CreateOrderPayload {
  tableNumber: number;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
  paymentMethod?: "CASH" | "MOBILE_BANKING";
}

export interface CreateInventoryLogInput {
  itemName: string;
  quantity: number;
  changeType: "INCREASE" | "DECREASE";
}

// --- Inventory Interfaces ---

export interface InventoryLog {
  id: number;
  itemName: string;
  quantity: number;
  changeType: "INCREASE" | "DECREASE";
  createdAt: string;
}