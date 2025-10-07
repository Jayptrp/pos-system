import useSWR, { mutate } from "swr";
import { CategoryInput } from "@/lib/validation";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCategories() {
  const { data, error, mutate } = useSWR("/api/categories", fetcher);

  const createCategory = async (input: CategoryInput) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text());
    mutate();
  };
  
    const updateCategory = async (id: number, input: CategoryInput) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text());
    mutate();
  };

  const deleteCategory = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(await res.text());
    mutate();
  };

  return {
    categories: data,
    isLoading: !error && !data,
    isError: error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}