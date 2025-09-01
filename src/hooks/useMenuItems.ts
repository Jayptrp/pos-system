"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useMenuItems() {
  const { data, error, mutate } = useSWR("/api/menu-items", fetcher);

  return {
    menuItems: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
