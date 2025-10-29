import useSWR from "swr";
import { categorySchema } from "@/lib/validation";

const BASE_URL = "/api/categories";
const fetcher = (url: string) => fetch(url).then(res => res.json());

export type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createCategory = async (values: unknown): Promise<HookResult> => {
    const parsed = categorySchema.safeParse(values);
    // if (!parsed.success) {
    //   const fieldErrors: Record<string, string> = {};
    //   for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
    //     fieldErrors[key] = value?.[0] ?? "Invalid value";
    //   }
    //   return { success: false, fieldErrors };
    // }

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to create category" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Create category failed:", err);
      return { success: false, error: "Unexpected error while creating category" };
    }
  };

  const updateCategory = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = categorySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = value?.[0] ?? "Invalid value";
      }
      return { success: false, fieldErrors };
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to update category" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Update category failed:", err);
      return { success: false, error: "Unexpected error while updating category" };
    }
  };

  const deleteCategory = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { success: false, error: json?.error || "Failed to delete category" };
      }

      await mutate();
      return { success: true };
    } catch (err) {
      console.error("Delete category failed:", err);
      return { success: false, error: "Unexpected error while deleting category" };
    }
  };

  return {
    categories: data ?? [],
    isLoading,
    isError: error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
