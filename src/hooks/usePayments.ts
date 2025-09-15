import useSWR from "swr";
import { paymentSchema } from "@/lib/validation";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const BASE_URL = "/api/payments";

export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(BASE_URL, fetcher);

  const createPayment = async (values: unknown) => {
    const parsed = paymentSchema.parse(values);
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to create payment");
    mutate();
  };

  const updatePayment = async (id: number, values: unknown) => {
    const parsed = paymentSchema.partial().parse(values);
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) throw new Error("Failed to update payment");
    mutate();
  };

  const deletePayment = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete payment");
    mutate();
  };

  return {
    payments: data ?? [],
    isLoading,
    isError: error,
    createPayment,
    updatePayment,
    deletePayment,
  };
}
