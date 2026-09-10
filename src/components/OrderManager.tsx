import { useEffect, useState } from "react";
import { checkoutRequest } from "@/lib/checkout";
import { formatTL } from "@/data/products";
type Order = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  items: { name: string; size: string; quantity: number }[];
  amount: number;
  discount: number;
  status: string;
  created_at: string;
  test_mode: boolean;
  payment_method: "card" | "bank_transfer";
};
export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);
  async function load(nextPage = 0) {
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      setOrders(await checkoutRequest("admin", { token, page: nextPage }));
      setPage(nextPage);
      setLoaded(true);
    } catch (e) {
      setOrders([]);
      setLoaded(false);
      setError(e instanceof Error ? e.message : "Siparişler alınamadı.");
    } finally {
      setBusy(false);
    }
  }
  async function updateBankOrder(id: string, status: "paid" | "failed") {
    if (
      !window.confirm(
        status === "paid" ? "Havale hesaba ulaştı mı?" : "Bu havale siparişi iptal edilsin mi?",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      await checkoutRequest("admin-order-status", { token, id, status });
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sipariş güncellenemedi.");
      setBusy(false);
    }
  }
  useEffect(() => {
    void load(0);
  }, []);
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl font-bold">Siparişler</h2>
      <button
        onClick={() => load(page)}
        disabled={busy}
        className="rounded-xl bg-stone-900 px-5 py-3 text-white"
      >
        {busy ? "Yükleniyor…" : "Siparişleri yenile"}
      </button>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {loaded && !orders.length && <p>Bu sayfada sipariş bulunmuyor.</p>}
      {orders.map((o) => (
        <article key={o.id} className="rounded-2xl border bg-white p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <strong className="break-all">{o.id}</strong>
            <span>
              {
                (
                  {
                    paid: "Ödendi",
                    pending: "Kart ödemesi bekleniyor",
                    awaiting_transfer: "Havale bekleniyor",
                    failed: "Başarısız",
                  } as Record<string, string>
                )[o.status]
              }
              {o.test_mode ? " · Test" : ""}
              {o.payment_method === "bank_transfer" ? " · Havale/EFT" : " · Kart"}
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            {new Date(o.created_at).toLocaleString("tr-TR")}
          </p>
          <p className="mt-4">
            {o.customer.name} · {o.customer.phone} · {o.customer.email}
          </p>
          <p>
            {o.customer.address}, {o.customer.district} / {o.customer.city}
          </p>
          <ul className="my-4 space-y-1">
            {o.items.map((i, n) => (
              <li key={n}>
                {i.quantity} × {i.name}
                {i.size ? " · " + i.size : ""}
              </li>
            ))}
          </ul>
          <strong>
            {formatTL(o.amount / 100)} · Kargo ücretsiz
            {o.discount > 0 && ` · İndirim: ${formatTL(o.discount / 100)}`}
          </strong>
          {o.payment_method === "bank_transfer" && o.status === "awaiting_transfer" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                disabled={busy}
                onClick={() => updateBankOrder(o.id, "paid")}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Ödeme geldi
              </button>
              <button
                disabled={busy}
                onClick={() => updateBankOrder(o.id, "failed")}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
              >
                İptal et
              </button>
            </div>
          )}
        </article>
      ))}
      {loaded && (
        <div className="flex gap-4">
          <button disabled={busy || page === 0} onClick={() => load(page - 1)}>
            ← Önceki
          </button>
          <span>Sayfa {page + 1}</span>
          <button disabled={busy || orders.length < 50} onClick={() => load(page + 1)}>
            Sonraki →
          </button>
        </div>
      )}
    </section>
  );
}
