import useSWR from "swr";
import { orderItemSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/fetcher";
import { HookResult, OrderItem } from "@/lib/types";

const BASE_URL = "/api/order-items";

export function useOrderItems() {
  const { data, error, isLoading, mutate } = useSWR<OrderItem[]>(BASE_URL, apiFetch);

  const createOrderItem = async (values: unknown): Promise<HookResult> => {
    const parsed = orderItemSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to create order item" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateOrderItem = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = orderItemSchema.partial().safeParse(values);
    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to update order item" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteOrderItem = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to delete order item" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    orderItems: data ?? [],
    isLoading,
    isError: error,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
  };
}
