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
    ...(path === "quote" ? { signal: AbortSignal.timeout(15000) } : {}),
  }).catch((error: unknown) => {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError"))
      throw new CheckoutError("Sepet hesaplama isteği zaman aşımına uğradı. Tekrar deneyin.");
    throw new CheckoutError("Sunucuya bağlanılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
  });
  const result = await response.json().catch(() => {
    throw new CheckoutError("Sunucudan geçerli yanıt alınamadı. Tekrar deneyin.");
  });
  if (!response.ok)
    throw new CheckoutError(
      result.error ?? "İşlem tamamlanamadı.",
      result.id && result.access ? { id: result.id, access: result.access } : undefined,
    );
  return result;
}
