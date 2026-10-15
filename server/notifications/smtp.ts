import nodemailer from "nodemailer";
import { z } from "zod";
import { orderMessage, type Audience, type EmailOrder } from "./messages.ts";
const email = z.string().email();
export function createOrderMailer(env: NodeJS.ProcessEnv = process.env) {
  const from = email.parse(env.SMTP_FROM);
  const admin = email.parse(env.ORDER_ADMIN_EMAIL);
  const override = env.ORDER_EMAIL_TEST_TO ? email.parse(env.ORDER_EMAIL_TEST_TO) : undefined;
  const port = Number(env.SMTP_PORT ?? 587);
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || ![465, 587].includes(port))
    throw new Error("SMTP configuration missing");
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { minVersion: "TLSv1.2" },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return {
    verify: () => transport.verify(),
    async send(order: EmailOrder, audience: Audience) {
      const to = override ?? (audience === "admin" ? admin : email.parse(order.customer.email));
      const result = await transport.sendMail({
        from: { name: "MinaToi", address: from },
        to,
        messageId: `<${order.id}.${audience}@${from.split("@")[1]}>`,
        ...orderMessage(order, audience, Boolean(override)),
      });
      if (!result.accepted.length || result.rejected.length)
        throw new Error("SMTP recipient rejected");
    },
  };
}
