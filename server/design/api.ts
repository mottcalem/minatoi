import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";

const fields = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[^\r\n]+$/),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .regex(/^[^\r\n]+$/),
  phone: z.string().trim().max(40),
  details: z.string().trim().min(1).max(4000),
});
const MAX_FILE = 12 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 64 * 1024;

export function designAttachment(buffer: Buffer, type: string) {
  const extension =
    type === "image/png"
      ? "png"
      : type === "image/jpeg"
        ? "jpg"
        : type === "image/webp"
          ? "webp"
          : null;
  const valid =
    extension === "png"
      ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : extension === "jpg"
        ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
        : extension === "webp" &&
          buffer.toString("ascii", 0, 4) === "RIFF" &&
          buffer.toString("ascii", 8, 12) === "WEBP";
  if (!valid || !buffer.length || buffer.length > MAX_FILE) throw new Error("invalid_image");
  return { filename: `tasarim-gorseli.${extension}`, content: buffer, contentType: type };
}

export function createDesignMailer(env: NodeJS.ProcessEnv = process.env) {
  if (!env.NOTIFIVA_SMTP_PASSWORD) throw new Error("design_smtp_missing");
  const transport = nodemailer.createTransport({
    host: "smtp.notifiva.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: "notifiva", pass: env.NOTIFIVA_SMTP_PASSWORD },
    tls: { minVersion: "TLSv1.2" },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return {
    verify: () => transport.verify(),
    async send(
      input: z.infer<typeof fields>,
      attachment: ReturnType<typeof designAttachment>,
      id: string,
    ) {
      const result = await transport.sendMail({
        from: { name: "MinaToi Tasarım", address: "no-reply@e.dijitalpanter.com" },
        to: "info@minatoi.com",
        replyTo: { name: input.name, address: input.email },
        subject: `Yeni tasarım talebi — ${id}`,
        text: `Talep no: ${id}\nAd soyad: ${input.name}\nE-posta: ${input.email}\nTelefon: ${input.phone || "Belirtilmedi"}\n\n${input.details}\n\nMüşterinin görseli ektedir.`,
        attachments: [attachment],
      });
      if (!result.accepted.length || result.rejected.length)
        throw new Error("design_recipient_rejected");
    },
  };
}

type Mailer = ReturnType<typeof createDesignMailer>;
export function createDesignAPI(
  env: NodeJS.ProcessEnv,
  getMailer: () => Pick<Mailer, "send"> = () => createDesignMailer(env),
) {
  const attempts = new Map<string, { count: number; until: number }>();
  return async (request: Request) => {
    const json = (data: unknown, status = 200) =>
      Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
    if (request.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);
    const origin = request.headers.get("origin");
    const allowed = [
      env.PAYTR_PUBLIC_URL?.replace(/\/$/, ""),
      ...(env.CHECKOUT_ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim().replace(/\/$/, "")),
    ];
    if (env.NODE_ENV !== "production")
      allowed.push("http://localhost:8080", "http://127.0.0.1:8080");
    if (!origin || !allowed.includes(origin))
      return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const ip =
      env.PAYTR_TRUST_PROXY === "1" ? (request.headers.get("x-real-ip") ?? "unknown") : "unknown";
    const attempt = attempts.get(ip) ?? { count: 0, until: now + 15 * 60 * 1000 };
    if (attempt.count >= 5 || (attempts.size >= 10000 && !attempts.has(ip)))
      return json({ error: "Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin." }, 429);
    attempt.count++;
    attempts.set(ip, attempt);
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      return json({ error: "Geçersiz form." }, 400);
    if (Number(request.headers.get("content-length")) > MAX_BODY)
      return json({ error: "Görsel en fazla 12 MB olabilir." }, 413);
    let input: z.infer<typeof fields>, attachment: ReturnType<typeof designAttachment>;
    try {
      const reader = request.body?.getReader();
      if (!reader) return json({ error: "Form boş." }, 400);
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > MAX_BODY) {
          await reader.cancel();
          return json({ error: "Görsel en fazla 12 MB olabilir." }, 413);
        }
        chunks.push(value);
      }
      const form = await new Response(Buffer.concat(chunks), {
        headers: { "Content-Type": request.headers.get("content-type")! },
      }).formData();
      input = fields.parse(
        Object.fromEntries(
          ["name", "email", "phone", "details"].map((key) => [key, form.get(key) ?? ""]),
        ),
      );
      const photo = form.get("photo");
      if (!(photo instanceof File) || photo.size > MAX_FILE) throw new Error("invalid_image");
      attachment = designAttachment(Buffer.from(await photo.arrayBuffer()), photo.type);
    } catch {
      return json(
        {
          error:
            "İletişim bilgilerini kontrol edin ve JPG, PNG veya WebP formatında, en fazla 12 MB bir görsel seçin.",
        },
        400,
      );
    }
    const id = `MT-${randomUUID()}`;
    try {
      await getMailer().send(input, attachment, id);
      return json({ ok: true, id });
    } catch {
      return json(
        {
          error:
            "Talebiniz gönderilemedi. Bilgileriniz korunuyor; lütfen daha sonra tekrar deneyin.",
        },
        503,
      );
    }
  };
}
export const designAPI = createDesignAPI(process.env);
