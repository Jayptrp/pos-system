export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!res.ok || !json.ok) {
    const message = json?.error?.message ?? "Something went wrong";
    throw new Error(message);
  }

  return json.data as T;
}
