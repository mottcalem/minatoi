import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { checkoutRequest, CheckoutError } from "@/lib/checkout";
import { formatTL } from "@/data/products";
export const Route = createFileRoute("/sepet")({
  head: () => ({
    meta: [{ title: "Sepetim — MinaToi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CartPage,
});
type Quote = {
  paymentAvailable: boolean;
  bankTransferAvailable: boolean;
  amount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  items: { slug: string; size: string; quantity: number; name: string; unitAmount: number }[];
};
function CartPage() {
  const { items, ready, update } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [pendingOrder, setPendingOrder] = useState<{ id: string; access: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");
  const [bankOrder, setBankOrder] = useState<{
    id: string;
    access: string;
    amount: number;
    bankTransfer: { iban: string; accountHolder: string; bankName: string };
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<{
    token: string;
    id: string;
    access: string;
    amount: number;
  } | null>(null);
  const requestId = useRef("");
  const lastPayload = useRef("");
  const cartJSON = JSON.stringify(
    items.map(({ slug, size, quantity }) => ({ slug, size, quantity })),
  );
  useEffect(() => {
    let active = true;
    setQuote(null);
    setError("");
    if (cartJSON !== "[]")
      checkoutRequest("quote", { items: JSON.parse(cartJSON) })
        .then((q) => {
          if (active) setQuote(q);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [cartJSON]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      ["name", "email", "phone", "city", "district", "address"].map((k) => [
        k,
        String(form.get(k) ?? ""),
      ]),
    );
    const payload = {
      items: JSON.parse(cartJSON),
      customer,
      consent: form.get("consent") === "on",
      expectedAmount: quote.amount,
      paymentMethod,
    };
    const serialized = JSON.stringify(payload);
    try {
      if (lastPayload.current !== serialized) {
        const fingerprint = Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serialized)),
          ),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        let previous: { fingerprint?: string; requestId?: string } = {};
        try {
          previous = JSON.parse(sessionStorage.getItem("minatoi-payment-attempt") ?? "{}");
        } catch {
          /* Optional storage. */
        }
        requestId.current =
          previous.fingerprint === fingerprint && previous.requestId
            ? previous.requestId
            : crypto.randomUUID();
        lastPayload.current = serialized;
        try {
          sessionStorage.setItem(
            "minatoi-payment-attempt",
            JSON.stringify({ fingerprint, requestId: requestId.current }),
          );
        } catch {
          /* In-memory id still protects repeated submits. */
        }
      }
      const endpoint = paymentMethod === "bank_transfer" ? "bank-transfer" : "start";
      const { paymentMethod: _paymentMethod, ...checkoutPayload } = payload;
      const result = await checkoutRequest(endpoint, {
        ...checkoutPayload,
        requestId: requestId.current,
      });
      try {
        sessionStorage.setItem(
          "minatoi-order",
          JSON.stringify({ id: result.id, access: result.access, cart: cartJSON }),
        );
      } catch {
        /* Payment can proceed using the result link without browser storage. */
      }
      if (paymentMethod === "bank_transfer") {
        setBankOrder(result);
        return;
      }
      if (result.status) {
        window.location.href =
          "/odeme-sonucu#" + new URLSearchParams({ id: result.id, access: result.access });
        return;
      }
      setPayment(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ödeme başlatılamadı.");
      if (e instanceof CheckoutError && e.order) {
        setPendingOrder(e.order);
        try {
          sessionStorage.setItem("minatoi-order", JSON.stringify({ ...e.order, cart: cartJSON }));
        } catch {
          /* Link contains the order reference. */
        }
      }
    } finally {
      setBusy(false);
    }
  }
  if (!ready) return <div className="p-12 text-center">Sepet yükleniyor…</div>;
  if (bankOrder)
    return (
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Havale / EFT</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Siparişiniz oluşturuldu</h1>
        <p className="mt-4 text-stone-600">
          Açıklama alanına sipariş numaranızı yazarak {formatTL(bankOrder.amount / 100)} gönderin.
          Ödeme kontrol edildikten sonra siparişiniz hazırlanacaktır.
        </p>
        <dl className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <div>
            <dt className="text-sm text-stone-500">Banka</dt>
            <dd className="font-semibold">{bankOrder.bankTransfer.bankName}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Hesap sahibi</dt>
            <dd className="font-semibold">{bankOrder.bankTransfer.accountHolder}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">IBAN</dt>
            <dd className="break-all font-mono font-semibold">{bankOrder.bankTransfer.iban}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Açıklama / sipariş no</dt>
            <dd className="break-all font-semibold">{bankOrder.id}</dd>
          </div>
        </dl>
        <a
          href={
            "/odeme-sonucu#" + new URLSearchParams({ id: bankOrder.id, access: bankOrder.access })
          }
          className="mt-6 inline-block underline"
        >
          Sipariş durumunu görüntüle
        </a>
      </section>
    );
  if (payment)
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Güvenli ödeme</h1>
        <p className="my-4">{formatTL(payment.amount / 100)} · Tek çekim · Ücretsiz kargo</p>
        <iframe
          title="PayTR güvenli kart ödeme formu"
          src={"https://www.paytr.com/odeme/guvenli/" + payment.token}
          className="w-full min-h-[850px] border-0"
          allow="payment"
        />
        <a
          className="underline"
          href={"/odeme-sonucu#" + new URLSearchParams({ id: payment.id, access: payment.access })}
        >
          Sipariş durumunu kontrol et
        </a>
        <p className="mt-4 text-sm text-stone-500">Ödeme tamamlanmadıysa sepetiniz korunur.</p>
      </section>
    );
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-widest text-primary">MinaToi alışveriş</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Sepetim</h1>
      {!items.length ? (
        <div className="my-10 rounded-2xl bg-stone-50 p-10 text-center">
          <p>Sepetiniz henüz boş.</p>
          <Link
            to="/urunler"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-white"
          >
            Ürünleri keşfet
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {items.map((i) => (
              <div
                key={i.slug + "|" + i.size}
                className="flex gap-4 rounded-2xl border border-stone-200 p-4"
              >
                <img src={i.image} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/urun/$slug" params={{ slug: i.slug }} className="font-semibold">
                    {i.name}
                  </Link>
                  {i.size && <p className="text-sm text-stone-500">Ölçü: {i.size}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => update(i.slug, i.size, i.quantity - 1)}
                      className="h-9 w-9 rounded border"
                      aria-label={`${i.name} adet azalt`}
                    >
                      −
                    </button>
                    <span>{i.quantity}</span>
                    <button
                      type="button"
                      disabled={busy || i.quantity >= 20}
                      onClick={() => update(i.slug, i.size, i.quantity + 1)}
                      className="h-9 w-9 rounded border"
                      aria-label={`${i.name} adet artır`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => update(i.slug, i.size, 0)}
                      className="text-sm underline"
                    >
                      Kaldır
                    </button>
                  </div>
                  {quote && (
                    <p className="mt-2 text-primary">
                      {formatTL(
                        ((quote.items.find((q) => q.slug === i.slug && q.size === i.size)
                          ?.unitAmount ?? 0) *
                          i.quantity) /
                          100,
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-stone-50 p-6">
              <p className="mb-4 text-sm text-stone-600">
                2 ürün ve üzeri alışverişte, en ucuz ürünün bir adedine %25 indirim. Sepet başına
                bir kez uygulanır.
              </p>
              {quote && (
                <div className="mb-3 flex justify-between">
                  <span>Ara toplam</span>
                  <span>{formatTL(quote.subtotal / 100)}</span>
                </div>
              )}
              {!!quote?.discount && (
                <div className="mb-3 flex justify-between text-green-700">
                  <span>İkinci ürün indirimi (%25)</span>
                  <strong>−{formatTL(quote.discount / 100)}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kargo</span>
                <strong>Ücretsiz</strong>
              </div>
              <div className="mt-4 flex justify-between text-xl">
                <strong>Toplam</strong>
                <strong>{quote ? formatTL(quote.amount / 100) : "Hesaplanıyor…"}</strong>
              </div>
              <p className="mt-3 text-sm text-stone-500">
                Kartla tek çekim veya havale/EFT. Üyelik gerekmez.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Teslimat bilgileri</h2>
            <fieldset disabled={busy} className="space-y-4">
              {[
                { name: "name", label: "Ad soyad", auto: "name", max: 60, min: 3 },
                { name: "email", label: "E-posta", auto: "email", max: 100, type: "email" },
                { name: "phone", label: "Telefon", auto: "tel", max: 20, min: 10, type: "tel" },
                { name: "city", label: "İl", auto: "address-level1", max: 60, min: 2 },
                { name: "district", label: "İlçe", auto: "address-level2", max: 60, min: 2 },
              ].map((f) => (
                <label key={f.name} className="block text-sm font-medium">
                  {f.label}
                  <input
                    required
                    name={f.name}
                    type={f.type ?? "text"}
                    autoComplete={f.auto}
                    maxLength={f.max}
                    minLength={f.min}
                    className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-3"
                  />
                </label>
              ))}
              <label className="block text-sm font-medium">
                Açık adres
                <textarea
                  required
                  name="address"
                  autoComplete="street-address"
                  minLength={10}
                  maxLength={250}
                  rows={3}
                  className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-3"
                />
              </label>
              <p className="text-sm text-stone-500">Teslimat ülkesi: Türkiye</p>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" name="consent" required className="mt-1" />
                <span>
                  <a
                    href="/mesafeli-satis-sozlesmesi"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Mesafeli satış sözleşmesini
                  </a>{" "}
                  ve sipariş özetini okudum, onaylıyorum.{" "}
                  <a href="/kvkk" target="_blank" rel="noreferrer" className="underline">
                    Kişisel verilerin işlenmesi hakkında bilgi
                  </a>
                  .
                </span>
              </label>
            </fieldset>
            <fieldset className="space-y-3" disabled={busy}>
              <legend className="mb-2 font-display text-xl font-bold">Ödeme yöntemi</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span>
                  <strong className="block">Kredi / banka kartı</strong>
                  <small className="text-stone-500">PayTR ile güvenli, tek çekim</small>
                </span>
              </label>
              <label
                className={`flex items-start gap-3 rounded-xl border border-stone-200 p-4 ${quote?.bankTransferAvailable ? "cursor-pointer" : "opacity-50"}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  disabled={!quote?.bankTransferAvailable}
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                <span>
                  <strong className="block">Havale / EFT</strong>
                  <small className="text-stone-500">
                    {quote?.bankTransferAvailable
                      ? "Sipariş sonrası IBAN bilgileri gösterilir"
                      : "Banka bilgileri hazırlanıyor"}
                  </small>
                </span>
              </label>
            </fieldset>
            <button
              disabled={
                !quote ||
                busy ||
                (paymentMethod === "card" ? !quote.paymentAvailable : !quote.bankTransferAvailable)
              }
              className="w-full rounded-full bg-gradient-gold px-6 py-4 font-semibold text-white disabled:opacity-50"
            >
              {paymentMethod === "card" && quote && !quote.paymentAvailable
                ? "Kartla ödeme şu anda kapalı"
                : paymentMethod === "bank_transfer" && quote && !quote.bankTransferAvailable
                  ? "Havale/EFT şu anda kapalı"
                  : busy
                    ? "Ödeme hazırlanıyor…"
                    : (paymentMethod === "bank_transfer"
                        ? "Havale siparişi oluştur"
                        : "Ödemeye geç") + (quote ? " · " + formatTL(quote.amount / 100) : "")}
            </button>
          </form>
        </div>
      )}
      {pendingOrder && (
        <a
          className="mt-5 block underline"
          href={"/odeme-sonucu#" + new URLSearchParams(pendingOrder)}
        >
          Mevcut siparişin durumunu kontrol et
        </a>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
