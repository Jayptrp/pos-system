import useSWR, { mutate } from "swr";
import { CategoryInput } from "@/lib/validation";

const BASE_URL = "/api/categories";
const fetcher = (url: string) => fetch(url).then(res => res.json());

/* replaced union type with a single shape where optional fields exist on success or failure */
type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createCategory = async (values: unknown): Promise<HookResult> => {
    const name = (values as any)?.name?.toString()?.trim?.() ?? "";

    if (!name) {
      return { success: false, fieldErrors: { name: "Please enter a category name." } };
    }

    const existing = (data ?? []).find(
      (c: any) => c.name && c.name.toString().toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return { success: false, fieldErrors: { name: "Category name already exists." } };
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      try {
        const json = await res.json();
        return { success: false, error: json?.error || "Failed to create category" };
      } catch {
        return { success: false, error: "Failed to create category" };
      }
    }

    await mutate();
    return { success: true };
  };

  const updateCategory = async (id: number, values: unknown): Promise<HookResult> => {
    const name = (values as any)?.name?.toString()?.trim?.() ?? "";

    if (!name) {
      return { success: false, fieldErrors: { name: "Please enter a category name." } };
    }

    const existing = (data ?? []).find(
      (c: any) => c.id !== id && c.name && c.name.toString().toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return { success: false, fieldErrors: { name: "Category name already exists." } };
    }

    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      try {
        const json = await res.json();
        return { success: false, error: json?.error || "Failed to update category" };
      } catch {
        return { success: false, error: "Failed to update category" };
      }
    }

    await mutate();
    return { success: true };
  };

  const deleteCategory = async (id: number): Promise<HookResult> => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      try {
        const json = await res.json();
        return { success: false, error: json?.error || "Failed to delete category" };
      } catch {
        return { success: false, error: "Failed to delete category" };
      }
    }
    await mutate();
    return { success: true };
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