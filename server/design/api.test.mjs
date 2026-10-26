import test from "node:test";
import assert from "node:assert/strict";
import { createDesignAPI, designAttachment } from "./api.ts";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
const env = {
  NODE_ENV: "production",
  PAYTR_PUBLIC_URL: "https://minatoi.com",
  PAYTR_TRUST_PROXY: "1",
};
function request({
  origin = "https://minatoi.com",
  photo = png,
  email = "buyer@example.com",
} = {}) {
  const data = new FormData();
  data.set("name", "Test Müşteri");
  data.set("email", email);
  data.set("phone", "05555555555");
  data.set("details", "Tür: Doğrudan baskı\nÖlçü: 35 × 50 cm\nYön: Dikey");
  data.set("photo", new Blob([photo], { type: "image/png" }), "../../unsafe.png");
  return new Request("https://minatoi.com/api/design-requests", {
    method: "POST",
    headers: { origin, "x-real-ip": "192.0.2.1" },
    body: data,
  });
}
test("sends contact and design details with original image bytes, then confirms", async () => {
  let sent;
  const api = createDesignAPI(env, () => ({
    send: async (...args) => {
      sent = args;
    },
  }));
  const response = await api(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.match(result.id, /^MT-/);
  assert.equal(sent[0].email, "buyer@example.com");
  assert.match(sent[0].details, /35 × 50/);
  assert.equal(sent[1].filename, "tasarim-gorseli.png");
  assert.deepEqual(sent[1].content, png);
  assert.equal(sent[2], result.id);
});
test("invalid image, invalid contact and foreign origin never send mail", async () => {
  let sends = 0;
  const api = createDesignAPI(env, () => ({
    send: async () => {
      sends++;
    },
  }));
  assert.equal((await api(request({ photo: Buffer.from("not an image") }))).status, 400);
  assert.equal((await api(request({ email: "bad" }))).status, 400);
  assert.equal((await api(request({ origin: "https://other.example" }))).status, 403);
  assert.equal(sends, 0);
  assert.throws(() => designAttachment(Buffer.alloc(12 * 1024 * 1024 + 1), "image/png"));
});
test("SMTP failures never report success or expose credentials", async () => {
  const api = createDesignAPI(env, () => ({
    send: async () => {
      throw new Error("private SMTP credentials");
    },
  }));
  const response = await api(request());
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.ok, undefined);
  assert.ok(!body.error.includes("credentials"));
});
test("rate limits repeated submissions and rejects oversized requests", async () => {
  const api = createDesignAPI(env, () => ({ send: async () => {} }));
  for (let i = 0; i < 5; i++) assert.equal((await api(request())).status, 200);
  assert.equal((await api(request())).status, 429);
  const oversized = request();
  oversized.headers.set("x-real-ip", "192.0.2.2");
  oversized.headers.set("content-length", String(14 * 1024 * 1024));
  assert.equal((await api(oversized)).status, 413);
});
