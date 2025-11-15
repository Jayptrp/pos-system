import useSWR from "swr";
import { menuItemSchema } from "@/lib/validation";
import type { HookResult } from "@/lib/types";
import { apiFetch } from "@/lib/fetcher";
import { z } from "zod";

// 2. Extract the TypeScript type from your Zod schema
type MenuItem = z.infer<typeof menuItemSchema>;

const BASE_URL = "/api/menu-items";

export function useMenuItems() {
  const { data, error, isLoading, mutate } = useSWR<MenuItem[]>(BASE_URL, apiFetch);

  const createMenuItem = async (values: unknown): Promise<HookResult> => {
    const parsed = menuItemSchema.safeParse(values);
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
        return { success: false, error: json?.error || "Failed to create menu item" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Create menu item failed:", err);
      return { success: false, error: "Unexpected error while creating menu item" };
    }
  };

  const updateMenuItem = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = menuItemSchema.partial().safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = value?.[0] ?? "Invalid value";
      }
      return { success: false, fieldErrors };
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error.message || "Failed to update menu item" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Update menu item failed:", err);
      return { success: false, error: "Unexpected error while updating menu item" };
    }
  };

  const deleteMenuItem = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error.message || "Failed to delete menu item" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Delete menu item failed:", err);
      return { success: false, error: "Unexpected error while deleting menu item" };
    }
  };

  return {
    menuItems: data ?? [],
    isLoading,
    isError: error,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
