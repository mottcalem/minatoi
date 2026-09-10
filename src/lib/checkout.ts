export class CheckoutError extends Error {
  order?: { id: string; access: string };
  constructor(message: string, order?: { id: string; access: string }) {
    super(message);
    this.order = order;
  }
}
export async function checkoutRequest(path: string, data: unknown) {
  const response = await fetch("/api/checkout/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new CheckoutError(
      result.error ?? "İşlem tamamlanamadı.",
      result.id && result.access ? { id: result.id, access: result.access } : undefined,
    );
  return result;
}
