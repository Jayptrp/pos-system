import useSWR from "swr";
import { orderSchema } from "@/lib/validation";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const BASE_URL = "/api/orders";

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createOrder = async (values: unknown) => {
    const parsed = orderSchema.parse(values);
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to create order");
    mutate();
  };

  const updateOrder = async (id: number, values: unknown) => {
    const parsed = orderSchema.partial().parse(values);
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to update order");
    mutate();
  };

  const deleteOrder = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete order");
    mutate();
  };

  return {
    orders: data ?? [],
    isLoading,
    isError: error,
    createOrder,
    updateOrder,
    deleteOrder,
  };
}
