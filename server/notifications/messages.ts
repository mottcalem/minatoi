import type { OrderCustomization } from "../../src/data/orderCustomization.ts";
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
  items: {
    name: string;
    size: string;
    quantity: number;
    unitAmount: number;
    discount: number;
    customization?: OrderCustomization;
  }[];
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
export function orderMessage(
  order: EmailOrder,
  audience: Audience,
  preview = false,
  siteUrl = "https://minatoi.com",
) {
  const title = audience === "customer" ? "Siparişiniz alındı" : "Yeni sipariş geldi";
  const introduction =
    audience === "customer"
      ? `Merhaba ${order.customer.name}, ödemeniz onaylandı ve siparişiniz alındı. Sipariş özetinizi ve teslimat bilgilerinizi aşağıda bulabilirsiniz. Bizi tercih ettiğiniz için teşekkür ederiz.`
      : `${order.customer.name} tarafından verilen siparişin ödemesi onaylandı.`;
  const test = preview || order.test_mode;
  const photoLink = (id: string) =>
    new URL(`/api/custom-order-images/${encodeURIComponent(id)}`, siteUrl).href;
  const rows = order.items.map(
    (item) =>
      `${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity}: ${money(item.unitAmount * item.quantity - item.discount)}${item.customization ? `\nTasarım: ${item.customization.style} · ${item.customization.orientation}\nYüklenen görsel: ${photoLink(item.customization.uploadId)}` : ""}`,
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
    html: `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif;color:#292524"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:16px"><tr><td style="padding:28px 24px"><p style="letter-spacing:3px;color:#8b7045">MİNATOİ</p>${notice ? `<p style="padding:12px;background:#fff3cd">${escape(notice)}</p>` : ""}<h1 style="font-size:26px">${title}</h1><p style="line-height:1.6">${escape(introduction)}</p><p style="font-size:13px;overflow-wrap:anywhere">Sipariş no: <strong>${escape(order.id)}</strong></p><h2 style="font-size:18px;margin-top:28px">Sipariş özeti</h2><table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-size:14px"><thead><tr style="background:#f5f3ef;text-align:left"><th scope="col">Ürün / Ölçü</th><th scope="col">Adet</th><th scope="col" style="text-align:right">Tutar</th></tr></thead><tbody>${order.items.map((item) => `<tr><td style="border-bottom:1px solid #eee">${escape(item.name)}${item.customization ? `<br><span>${escape(item.customization.style)} · ${escape(item.customization.orientation)}</span><br><a href="${escape(photoLink(item.customization.uploadId))}">Yüklenen görseli aç</a>` : ""}${item.size ? `<br><span style="color:#78716c">${escape(item.size)}</span>` : ""}<br><span style="color:#78716c">Birim: ${escape(money(item.unitAmount))}</span>${item.discount ? `<br><span>İndirim: ${escape(money(item.discount))}</span>` : ""}</td><td style="border-bottom:1px solid #eee">${escape(item.quantity)}</td><td style="border-bottom:1px solid #eee;text-align:right">${escape(money(item.unitAmount * item.quantity - item.discount))}</td></tr>`).join("")}</tbody></table><table role="presentation" width="100%" cellspacing="0" cellpadding="8" style="font-size:14px"><tr><td>Ara toplam</td><td align="right">${escape(money(order.amount + order.discount))}</td></tr>${order.discount ? `<tr><td>İndirim</td><td align="right">−${escape(money(order.discount))}</td></tr>` : ""}<tr><td>Kargo</td><td align="right">Ücretsiz</td></tr><tr style="background:#f5f3ef;font-size:18px"><td><strong>Toplam</strong></td><td align="right"><strong>${escape(money(order.amount))}</strong></td></tr></table><h2 style="font-size:18px;margin-top:28px">Teslimat ve iletişim bilgileri</h2><p style="line-height:1.7">${escape(order.customer.name)}<br>${escape(order.customer.address)}<br>${escape(order.customer.district)} / ${escape(order.customer.city)}<br>Telefon: ${escape(order.customer.phone)}<br>E-posta: ${escape(order.customer.email)}</p><p style="line-height:1.6;color:#78716c">${audience === "customer" ? "Sorularınız için bu e-postayı yanıtlayabilirsiniz. Size yardımcı olmaktan mutluluk duyarız." : "Ödemesi onaylanan siparişin hazırlık ve teslimat sürecini yönetim panelinden takip edebilirsiniz. Müşteriye ulaşmak için bu e-postayı yanıtlayabilirsiniz."}</p><p style="margin-top:28px;color:#78716c">MinaToi · <a href="https://minatoi.com" style="color:#8b7045">minatoi.com</a></p></td></tr></table></td></tr></table></body></html>`,
  };
}
