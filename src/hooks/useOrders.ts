import useSWR from "swr";
import { createOrderCompositeSchema, orderSchema } from "../lib/validation";
import { apiFetch } from "../lib/fetcher";
// Import the types from the shared types file
import type { HookResult, Order } from "../lib/types";

const BASE_URL = "/api/orders";

export function useOrders() {
  // Now we use the imported Order interface
  const { data, error, isLoading, mutate } = useSWR<Order[]>(BASE_URL, apiFetch);

  const createOrder = async (values: unknown): Promise<HookResult> => {
    const parsed = createOrderCompositeSchema.safeParse(values);
    
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = value?.[0] ?? "Invalid value";
      }
      return { success: false, fieldErrors };
    }

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to create order" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Create order failed:", err);
      return { success: false, error: "Unexpected error while creating order" };
    }
  };

  const updateOrder = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = orderSchema.partial().safeParse(values);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to update order" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unexpected error" };
    }
  };

  const deleteOrder = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to delete order" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unexpected error" };
    }
  };

  return {
    orders: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    createOrder,
    updateOrder,
    deleteOrder,
  };
}