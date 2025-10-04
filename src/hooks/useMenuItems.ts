import useSWR from "swr";
import { menuItemSchema } from "@/lib/validation";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const BASE_URL = "/api/menu-items";

export function useMenuItems() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createMenuItem = async (values: unknown) => {
    const parsed = menuItemSchema.parse(values);
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to create menu item");
    // mutate();
  };

  const updateMenuItem = async (id: number, values: unknown) => {
    const parsed = menuItemSchema.partial().parse(values);
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to update menu item");
    // mutate();
  };

  const deleteMenuItem = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete menu item");
    // mutate();
  };

  return {
    menuItems: data ?? [],
    isLoading,
    isError: error,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    mutate
  };
}
