// Add this type definition to the top of your hook file
export type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// --- Order Interfaces (Output Data) ---

export interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
}

export interface Payment {
  id: number;
  method: string;
  amount: number;
  transactionRef?: string;
}

export interface Order {
  id: number;
  tableNumber: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  orderItems: OrderItem[];
  payments: Payment[];
}