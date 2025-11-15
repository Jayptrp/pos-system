import useSWR from "swr";
import { inventoryLogSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/fetcher";

const BASE_URL = "/api/inventory-logs";

export function useInventoryLogs() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, apiFetch);

  const createInventoryLog = async (values: unknown) => {
    const parsed = inventoryLogSchema.parse(values);
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to create log");
    mutate();
  };

  const updateInventoryLog = async (id: number, values: unknown) => {
    const parsed = inventoryLogSchema.partial().parse(values);
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to update log");
    mutate();
  };

  const deleteInventoryLog = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete log");
    mutate();
  };

  return {
    inventoryLogs: data ?? [],
    isLoading,
    isError: error,
    createInventoryLog,
    updateInventoryLog,
    deleteInventoryLog,
  };
}
