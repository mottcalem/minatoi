import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { designAttachment } from "./api.ts";
import {
  requiresCustomization,
  type OrderCustomization,
} from "../../src/data/orderCustomization.ts";
import { normalizeSize } from "../../src/data/productPricing.ts";

const uuid = z.string().uuid();
const fields = z.object({
  slug: z.string().min(1).max(160),
  size: z.string().max(100),
  orientation: z.enum(["Dikey", "Yatay"]),
  style: z.string().trim().min(1).max(100),
});
type StoredUpload = OrderCustomization & { slug: string; size: string; contentType: string };
export function createUploadStore(directory = resolve(process.cwd(), "data", "order-uploads")) {
  return {
    async save(input: z.infer<typeof fields>, file: File): Promise<StoredUpload> {
      const attachment = designAttachment(Buffer.from(await file.arrayBuffer()), file.type);
      const uploadId = randomUUID();
      const record = {
        ...input,
        uploadId,
        filename: file.name.replace(/[\r\n/\\]/g, "").slice(0, 200),
        photoUrl: `/api/custom-order-images/${uploadId}`,
        contentType: attachment.contentType,
      };
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, `${uploadId}.image`), attachment.content, {
        flag: "wx",
        mode: 0o600,
      });
      try {
        await writeFile(resolve(directory, `${uploadId}.json`), JSON.stringify(record), {
          flag: "wx",
          mode: 0o600,
        });
      } catch (error) {
        await rm(resolve(directory, `${uploadId}.image`), { force: true });
        throw error;
      }
      return record;
    },
    async read(id: string): Promise<StoredUpload> {
      uuid.parse(id);
      return JSON.parse(await readFile(resolve(directory, `${id}.json`), "utf8"));
    },
    async image(id: string) {
      const record = await this.read(id);
      return { record, body: await readFile(resolve(directory, `${id}.image`)) };
    },
    async hydrate<
      T extends { slug: string; size: string; image: string; customization?: { uploadId: string } },
    >(items: T[]) {
      return Promise.all(
        items.map(async (item) => {
          if (!item.customization) return item;
          const record = await this.read(item.customization.uploadId).catch(() => {
            throw new Error("Yüklenen görsel bulunamadı. Lütfen görseli yeniden yükleyin.");
          });
          if (record.slug !== item.slug || normalizeSize(record.size) !== normalizeSize(item.size))
            throw new Error("Görsel ürün ve ölçü ile eşleşmiyor. Lütfen ürünü yeniden ekleyin.");
          const { uploadId, orientation, style, filename, photoUrl } = record;
          return {
            ...item,
            image: photoUrl,
            customization: { uploadId, orientation, style, filename, photoUrl },
          };
        }),
      );
    },
  };
}
export const orderUploadStore = createUploadStore();

export function createOrderUploadAPI(
  env: NodeJS.ProcessEnv,
  readProducts: () => Promise<
    { slug: string; category: string; customization?: unknown; sizes?: string[] }[]
  >,
  store = orderUploadStore,
) {
  const attempts = new Map<string, { count: number; until: number }>();
  return async (request: Request) => {
    const json = (data: unknown, status = 200) =>
      Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/custom-order-images/")) {
      if (request.method !== "GET") return json({ error: "Yöntem desteklenmiyor." }, 405);
      try {
        const { record, body } = await store.image(path.split("/").pop()!);
        return new Response(new Uint8Array(body), {
          headers: {
            "Content-Type": record.contentType,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      } catch {
        return json({ error: "Görsel bulunamadı." }, 404);
      }
    }
    if (request.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);
    const allowed = [
      env.PAYTR_PUBLIC_URL?.replace(/\/$/, ""),
      ...(env.CHECKOUT_ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim().replace(/\/$/, "")),
    ];
    if (env.NODE_ENV !== "production")
      allowed.push("http://localhost:8080", "http://127.0.0.1:8080");
    if (!request.headers.get("origin") || !allowed.includes(request.headers.get("origin")!))
      return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const ip =
      env.PAYTR_TRUST_PROXY === "1" ? (request.headers.get("x-real-ip") ?? "unknown") : "unknown";
    const attempt = attempts.get(ip) ?? { count: 0, until: now + 15 * 60 * 1000 };
    if (attempt.count >= 10 || (attempts.size >= 10000 && !attempts.has(ip)))
      return json({ error: "Çok fazla yükleme. Lütfen 15 dakika sonra tekrar deneyin." }, 429);
    attempt.count++;
    attempts.set(ip, attempt);
    const max = 12 * 1024 * 1024 + 64 * 1024;
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      return json({ error: "Geçersiz form." }, 400);
    if (Number(request.headers.get("content-length")) > max)
      return json({ error: "Görsel en fazla 12 MB olabilir." }, 413);
    let input: z.infer<typeof fields>, file: File;
    try {
      const reader = request.body?.getReader();
      if (!reader) throw new Error("empty");
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > max) {
          await reader.cancel();
          return json({ error: "Görsel en fazla 12 MB olabilir." }, 413);
        }
        chunks.push(part.value);
      }
      const form = await new Response(Buffer.concat(chunks), {
        headers: { "Content-Type": request.headers.get("content-type")! },
      }).formData();
      input = fields.parse(
        Object.fromEntries(
          ["slug", "size", "orientation", "style"].map((key) => [key, form.get(key)]),
        ),
      );
      const candidate = form.get("photo");
      if (!(candidate instanceof File) || candidate.size > 12 * 1024 * 1024)
        throw new Error("invalid_image");
      file = candidate;
      designAttachment(Buffer.from(await file.arrayBuffer()), file.type);
      const product = (await readProducts()).find((p) => p.slug === input.slug);
      if (
        !product ||
        !requiresCustomization(product) ||
        !product.sizes?.some((size) => normalizeSize(size) === normalizeSize(input.size))
      )
        throw new Error("invalid_product");
    } catch {
      return json(
        {
          error:
            "Ürün, ölçü ve görseli kontrol edin. JPG, PNG veya WebP formatında, en fazla 12 MB görsel yükleyin.",
        },
        400,
      );
    }
    try {
      const { uploadId, orientation, style, filename, photoUrl } = await store.save(input, file);
      return json({ customization: { uploadId, orientation, style, filename, photoUrl } });
    } catch {
      return json({ error: "Görsel kaydedilemedi. Lütfen tekrar deneyin." }, 503);
    }
  };
}
