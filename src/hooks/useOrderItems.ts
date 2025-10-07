import useSWR from "swr";
import { orderItemSchema } from "@/lib/validation";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const BASE_URL = "/api/order-items";

export function useOrderItems() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createOrderItem = async (values: unknown) => {
    const parsed = orderItemSchema.parse(values);
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to create order item");
  };

  const updateOrderItem = async (id: number, values: unknown) => {
    const parsed = orderItemSchema.partial().parse(values);
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to update order item");
  };

  const deleteOrderItem = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete order item");
  };

  return {
    orderItems: data ?? [],
    isLoading,
    isError: error,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    mutate
  };
}
