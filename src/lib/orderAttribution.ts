import { z } from "zod";

const text = z.string().trim().max(200);
export const attributionSchema = z
  .object({
    utm_source: text.optional(),
    utm_medium: text.optional(),
    utm_campaign: text.optional(),
    utm_content: text.optional(),
    utm_term: text.optional(),
    googleClick: z.boolean().optional(),
    metaClick: z.boolean().optional(),
    referrerHost: z
      .string()
      .max(253)
      .regex(/^[a-z0-9.-]*$/i)
      .optional(),
    landingPath: z.string().startsWith("/").max(500).optional(),
    capturedAt: z.string().datetime().optional(),
  })
  .strict();
export type OrderAttribution = z.infer<typeof attributionSchema>;
const storageKey = "minatoi-order-attribution-v1";
const lifetime = 30 * 86400000;

export function attributionLabel(value?: OrderAttribution | null): string {
  if (!value?.capturedAt) return "Kaynak kaydedilmemiş";
  const source = value.utm_source?.toLowerCase() || "";
  const host = value.referrerHost || "";
  if (/^(meta|facebook|instagram|fb|ig)([._ -]|$)/.test(source))
    return "Meta (Facebook / Instagram)";
  if (/^google([._ -]|$)/.test(source)) return "Google";
  if (source) return value.utm_source!;
  if (value.googleClick) return "Google Ads";
  if (value.metaClick) return "Meta (Facebook / Instagram)";
  if (/(^|\.)(facebook\.com|instagram\.com|fb\.com)$/.test(host))
    return "Meta (Facebook / Instagram)";
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "Google";
  return host || "Doğrudan / bilinmiyor";
}

export function captureAttribution(
  href: string,
  referrer: string,
  storage: Pick<Storage, "getItem" | "setItem">,
  now = Date.now(),
): OrderAttribution {
  const url = new URL(href);
  let previous: OrderAttribution | undefined;
  try {
    const parsed = attributionSchema.safeParse(JSON.parse(storage.getItem(storageKey) || "null"));
    if (parsed.success && parsed.data.capturedAt) {
      const age = now - Date.parse(parsed.data.capturedAt);
      if (age >= 0 && age < lifetime) previous = parsed.data;
    }
  } catch {
    /* Storage is optional. */
  }
  const data: OrderAttribution = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const) {
    const value = url.searchParams.get(key)?.trim().slice(0, 200);
    if (value) data[key] = value;
  }
  if (["gclid", "gbraid", "wbraid"].some((key) => Boolean(url.searchParams.get(key))))
    data.googleClick = true;
  if (url.searchParams.get("fbclid")) data.metaClick = true;
  try {
    const from = new URL(referrer);
    if (
      from.hostname.replace(/^www\./, "") !== url.hostname.replace(/^www\./, "") &&
      !/(^|\.)paytr\.com$/.test(from.hostname)
    )
      data.referrerHost = from.hostname;
  } catch {
    /* No external referrer. */
  }
  if (!Object.keys(data).length && previous) return previous;
  data.landingPath = url.pathname.slice(0, 500);
  data.capturedAt = new Date(now).toISOString();
  try {
    storage.setItem(storageKey, JSON.stringify(data));
  } catch {
    /* Payment must remain available. */
  }
  return data;
}

let capturedDocument = false;
let current: OrderAttribution | undefined;
let lastHref = "";
export function captureCurrentAttribution(): OrderAttribution | undefined {
  if (typeof window === "undefined" || /^\/admin(?:\/|$)/.test(window.location.pathname)) return;
  if (capturedDocument && lastHref === window.location.href) return current;
  try {
    current = captureAttribution(
      window.location.href,
      capturedDocument ? "" : document.referrer,
      window.localStorage,
    );
  } catch {
    // Storage access may throw; still capture this visit in memory.
    const saved = current;
    current = captureAttribution(window.location.href, capturedDocument ? "" : document.referrer, {
      getItem: () => (saved ? JSON.stringify(saved) : null),
      setItem: () => {},
    });
  }
  capturedDocument = true;
  lastHref = window.location.href;
  return current;
}
