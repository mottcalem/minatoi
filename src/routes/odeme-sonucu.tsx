import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { checkoutRequest } from "@/lib/checkout";
export const Route = createFileRoute("/odeme-sonucu")({
  head: () => ({
    meta: [
      { title: "Sipariş durumu — MinaToi" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: Result,
});
function Result() {
  const { clear, ready } = useCart();
  const [status, setStatus] = useState("pending");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const params = new URLSearchParams(window.location.hash.slice(1));
    let saved: { id?: string; access?: string; cart?: string } = {};
    try {
      saved = JSON.parse(sessionStorage.getItem("minatoi-order") ?? "{}");
    } catch {
      /* The return URL remains a fallback when storage is unavailable. */
    }
    const order = params.get("id") ?? saved.id;
    const access = params.get("access") ?? saved.access;
    if (!order || !access) {
      setError("Sipariş bağlantısı bulunamadı.");
      return;
    }
    setId(order);
    try {
      sessionStorage.setItem("minatoi-order", JSON.stringify({ ...saved, id: order, access }));
      history.replaceState(null, "", window.location.pathname);
    } catch {
      /* Keep the fragment so refreshing can still retrieve the order. */
    }
    async function poll() {
      try {
        const result = await checkoutRequest("status", { id: order, access });
        if (!active) return;
        setStatus(result.status);
        setError("");
        if (result.status === "paid" || result.status === "failed") {
          try {
            sessionStorage.removeItem("minatoi-payment-attempt");
          } catch {
            /* Optional storage. */
          }
        }
        if (result.status === "paid") {
          if (saved.id === order && saved.cart) clear(saved.cart);
          return;
        }
        if (result.status === "failed") return;
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Durum alınamadı.");
      }
      if (active && ++attempts < 40) timer = setTimeout(poll, 3000);
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [ready, clear]);
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">
        {status === "paid"
          ? "Siparişiniz alındı"
          : status === "awaiting_transfer"
            ? "Havale/EFT ödemeniz bekleniyor"
            : status === "failed"
              ? "Ödeme tamamlanamadı"
              : "Ödeme sonucu bekleniyor"}
      </h1>
      <p className="mt-5 text-stone-600">
        {status === "paid"
          ? "Ödemeniz doğrulandı. Siparişiniz hazırlanmak üzere kaydedildi."
          : status === "awaiting_transfer"
            ? "Sipariş numaranızı havale açıklamasına yazarak ödemeyi tamamlayın. Ödeme kontrol edildiğinde siparişiniz hazırlanacaktır."
            : status === "failed"
              ? "Sepetiniz korunuyor. Bilgilerinizi kontrol ederek yeniden ödeme yapabilirsiniz."
              : "Ödeme sonucu doğrulandığında bu ekran güncellenecek. Kartınızdan çekim yapıldıysa yeniden ödeme başlatmadan durumu kontrol edin."}
      </p>
      {id && <p className="mt-5 break-all text-sm">Sipariş numarası: {id}</p>}
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        {status === "pending" && (
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border px-5 py-3"
          >
            Durumu yenile
          </button>
        )}
        <Link
          to={status === "paid" ? "/urunler" : "/sepet"}
          className="rounded-full bg-primary px-5 py-3 text-white"
        >
          {status === "paid" ? "Alışverişe devam et" : "Sepete dön"}
        </Link>
      </div>
    </section>
  );
}
