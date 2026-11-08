import test from "node:test";
import assert from "node:assert/strict";
import {
  attributionLabel,
  attributionSchema,
  captureAttribution,
} from "../src/lib/orderAttribution.ts";
function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}
const now = Date.parse("2026-11-01T12:00:00Z");
test("UTM survives navigation and direct return; latest campaign replaces it", () => {
  const s = storage();
  const meta = captureAttribution(
    "https://minatoi.com/?utm_source=ig&utm_medium=paid_social&utm_campaign=portraits&fbclid=private-id",
    "",
    s,
    now,
  );
  assert.equal(attributionLabel(meta), "Meta (Facebook / Instagram)");
  assert.equal(meta.utm_campaign, "portraits");
  assert(!JSON.stringify(meta).includes("private-id"));
  assert.deepEqual(
    captureAttribution(
      "https://minatoi.com/sepet",
      "https://www.minatoi.com/urunler",
      s,
      now + 1000,
    ),
    meta,
  );
  assert.deepEqual(
    captureAttribution("https://minatoi.com/odeme-sonucu", "https://www.paytr.com/", s, now + 1500),
    meta,
  );
  const google = captureAttribution(
    "https://minatoi.com/?utm_source=google&utm_campaign=glass&gclid=private-google-id",
    "",
    s,
    now + 2000,
  );
  assert.equal(attributionLabel(google), "Google");
  assert.equal(google.utm_campaign, "glass");
  assert(!JSON.stringify(google).includes("private-google-id"));
  assert.equal(
    attributionLabel(captureAttribution("https://minatoi.com/sepet", "", s, now + 31 * 86400000)),
    "Doğrudan / bilinmiyor",
  );
});
test("click and external referrer fallbacks classify Meta and Google; UTM takes precedence", () => {
  for (const [query, label] of [
    ["fbclid=x", "Meta (Facebook / Instagram)"],
    ["gclid=x", "Google Ads"],
    ["wbraid=x", "Google Ads"],
    ["gbraid=x", "Google Ads"],
    ["utm_source=newsletter&gclid=x", "newsletter"],
  ])
    assert.equal(
      attributionLabel(captureAttribution("https://minatoi.com/?" + query, "", storage(), now)),
      label,
    );
  assert.equal(
    attributionLabel(
      captureAttribution(
        "https://minatoi.com/",
        "https://www.google.com/search?q=private",
        storage(),
        now,
      ),
    ),
    "Google",
  );
  assert.equal(
    attributionLabel(
      captureAttribution("https://minatoi.com/", "https://l.instagram.com/private", storage(), now),
    ),
    "Meta (Facebook / Instagram)",
  );
  assert.equal(attributionLabel({}), "Kaynak kaydedilmemiş");
});
test("bad storage cannot break checkout; inputs are bounded and validated", () => {
  const broken = {
    getItem() {
      throw new Error("storage blocked");
    },
    setItem() {
      throw new Error("storage blocked");
    },
  };
  const value = captureAttribution(
    "https://minatoi.com/?utm_source=" + "x".repeat(500),
    "",
    broken,
    now,
  );
  assert.equal(value.utm_source.length, 200);
  assert(attributionSchema.safeParse(value).success);
  assert(!attributionSchema.safeParse({ utm_source: "x".repeat(201) }).success);
  assert(!attributionSchema.safeParse({ referrerHost: "https://example.com/secret" }).success);
  assert(!attributionSchema.safeParse({ unexpected: "value" }).success);
});
