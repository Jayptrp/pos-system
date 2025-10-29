import useSWR from "swr";
import { menuItemSchema } from "@/lib/validation";

const BASE_URL = "/api/menu-items";
const fetcher = (url: string) => fetch(url).then(res => res.json());

export type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function useMenuItems() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

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
        return { success: false, error: json?.error || "Failed to update menu item" };
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
        return { success: false, error: json?.error || "Failed to delete menu item" };
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
