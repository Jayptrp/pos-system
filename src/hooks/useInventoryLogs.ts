import useSWR from "swr";
import { inventoryLogSchema } from "../lib/validation";
import { apiFetch } from "../lib/fetcher";
import type { HookResult, InventoryLog } from "../lib/types";

const BASE_URL = "/api/inventory-logs";

export function useInventoryLogs() {
  const { data, error, isLoading, mutate } = useSWR<InventoryLog[]>(BASE_URL, apiFetch);

  const createInventoryLog = async (values: unknown): Promise<HookResult> => {
    const parsed = inventoryLogSchema.safeParse(values);
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
        return { success: false, error: json?.error?.message || "Failed to create log" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Create inventory log failed:", err);
      return { success: false, error: "Unexpected error" };
    }
  };

  const updateInventoryLog = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = inventoryLogSchema.partial().safeParse(values);
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
        return { success: false, error: json?.error?.message || "Failed to update log" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unexpected error" };
    }
  };

  const deleteInventoryLog = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error?.message || "Failed to delete log" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unexpected error" };
    }
  };

  return {
    inventoryLogs: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    createInventoryLog,
    updateInventoryLog,
    deleteInventoryLog,
  };
}