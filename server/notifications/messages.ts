export type EmailOrder = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    city: string;
  };
  items: { name: string; size: string; quantity: number; unitAmount: number; discount: number }[];
  amount: number;
  discount: number;
  test_mode: boolean;
};
export type Audience = "customer" | "admin";
const escape = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value / 100);
export function orderMessage(order: EmailOrder, audience: Audience, preview = false) {
  const title = audience === "customer" ? "Siparişiniz alındı" : "Yeni sipariş geldi";
  const introduction =
    audience === "customer"
      ? `Merhaba ${order.customer.name}, ödemeniz onaylandı ve siparişiniz alındı. Hazırlık süreci başladığında sizinle iletişime geçeceğiz.`
      : `${order.customer.name} tarafından verilen siparişin ödemesi onaylandı.`;
  const test = preview || order.test_mode;
  const rows = order.items.map(
    (item) =>
      `${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity}: ${money(item.unitAmount * item.quantity - item.discount)}`,
  );
  const details = [
    `Sipariş no: ${order.id}`,
    ...rows,
    ...(order.discount ? [`İndirim: ${money(order.discount)}`] : []),
    "Kargo: Ücretsiz",
    `Toplam: ${money(order.amount)}`,
    `Alıcı: ${order.customer.name}`,
    `E-posta: ${order.customer.email}`,
    `Telefon: ${order.customer.phone}`,
    `Teslimat adresi: ${order.customer.address}, ${order.customer.district}, ${order.customer.city}`,
  ];
  const notice = test ? "TEST BİLDİRİMİ — Bu ileti test amacıyla yönlendirilmiştir." : "";
  return {
    subject: `${test ? "[TEST] " : ""}MinaToi — ${title} | ${order.id}`,
    text: [notice, title, introduction, ...details, "MinaToi | https://minatoi.com"]
      .filter(Boolean)
      .join("\n\n"),
    html: `<!doctype html><html lang="tr"><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif;color:#292524"><main style="max-width:620px;margin:24px auto;background:#fff;padding:32px;border-radius:16px"><p style="letter-spacing:3px;color:#8b7045">MİNATOİ</p>${notice ? `<p style="padding:12px;background:#fff3cd">${escape(notice)}</p>` : ""}<h1 style="font-size:26px">${title}</h1><p style="line-height:1.6">${escape(introduction)}</p><div style="border-top:1px solid #eee;padding-top:16px">${details.map((line) => `<p style="line-height:1.5">${escape(line)}</p>`).join("")}</div><p style="margin-top:28px;color:#78716c">MinaToi · <a href="https://minatoi.com">minatoi.com</a></p></main></body></html>`,
  };
}
