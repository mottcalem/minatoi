import { cartReminderMessage, reminderLinks, type ReminderCart } from "./cartReminders.ts";
import nodemailer from "nodemailer";
import { z } from "zod";
import { orderMessage, type Audience, type EmailOrder } from "./messages.ts";
const email = z.string().email();
export function orderSmtpConfig(env: NodeJS.ProcessEnv = process.env) {
  const notifiva = !env.SMTP_HOST && Boolean(env.NOTIFIVA_SMTP_PASSWORD);
  const config = {
    host: env.SMTP_HOST || (notifiva ? "smtp.notifiva.com" : undefined),
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER || (notifiva ? "notifiva" : undefined),
    pass: env.SMTP_PASS || (notifiva ? env.NOTIFIVA_SMTP_PASSWORD : undefined),
    from: email.parse(env.SMTP_FROM || (notifiva ? "no-reply@e.dijitalpanter.com" : undefined)),
    admin: email.parse(env.ORDER_ADMIN_EMAIL || "info@minatoi.com"),
  };
  if (!config.host || !config.user || !config.pass || ![465, 587].includes(config.port))
    throw new Error("SMTP configuration missing");
  return config;
}
export function createOrderMailer(env: NodeJS.ProcessEnv = process.env) {
  const { host, port, user, pass, from, admin } = orderSmtpConfig(env);
  const override = env.ORDER_EMAIL_TEST_TO ? email.parse(env.ORDER_EMAIL_TEST_TO) : undefined;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { minVersion: "TLSv1.2" },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return {
    verify: () => transport.verify(),
    close: () => transport.close(),
    async sendReminder(cart: ReminderCart) {
      const links = reminderLinks(
        cart.id,
        env.CART_REMINDER_SECRET ?? "",
        env.PAYTR_PUBLIC_URL || "https://minatoi.com",
      );
      const result = await transport.sendMail({
        from: { name: "MinaToi", address: from },
        to: override ?? email.parse(cart.email),
        replyTo: admin,
        messageId: `<${cart.id}.cart-reminder@${from.split("@")[1]}>`,
        ...cartReminderMessage(cart, links, Boolean(override)),
      });
      if (!result.accepted.length || result.rejected.length)
        throw new Error("SMTP recipient rejected");
    },
    async send(order: EmailOrder, audience: Audience) {
      const to = override ?? (audience === "admin" ? admin : email.parse(order.customer.email));
      const result = await transport.sendMail({
        from: { name: "MinaToi", address: from },
        to,
        replyTo: audience === "admin" ? email.parse(order.customer.email) : admin,
        messageId: `<${order.id}.${audience}@${from.split("@")[1]}>`,
        ...orderMessage(
          order,
          audience,
          Boolean(override),
          env.PAYTR_PUBLIC_URL || "https://minatoi.com",
        ),
      });
      if (!result.accepted.length || result.rejected.length)
        throw new Error("SMTP recipient rejected");
    },
  };
}
