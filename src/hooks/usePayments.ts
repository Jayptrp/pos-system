import useSWR from "swr";
import { paymentSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/fetcher";
import { HookResult, Payment } from "@/lib/types";

const BASE_URL = "/api/payments";

export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR<Payment[]>(BASE_URL, apiFetch);

  const createPayment = async (values: unknown): Promise<HookResult> => {
    const parsed = paymentSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to create payment" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePayment = async (id: number, values: unknown): Promise<HookResult> => {
    const parsed = paymentSchema.partial().safeParse(values);
    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to update payment" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deletePayment = async (id: number): Promise<HookResult> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        return { success: false, error: json.error?.message || "Failed to delete payment" };
      }
      mutate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
