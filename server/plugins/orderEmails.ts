import { deliverNextCartReminder } from "../notifications/cartReminders";
import { definePlugin } from "nitro";
import { withTransaction } from "../utils/database";
import { deliverNextEmail } from "../notifications/queue";
import { createOrderMailer } from "../notifications/smtp";
export default definePlugin((nitro) => {
  if (process.env.ORDER_EMAIL_ENABLED !== "1") return;
  let running = false;
  const mailer = createOrderMailer();
  async function tick() {
    if (running) return;
    running = true;
    try {
      for (let i = 0; i < 10; i++) {
        if (!(await withTransaction((client) => deliverNextEmail(client, mailer.send)))) break;
      }
      if (process.env.CART_REMINDER_ENABLED === "1") {
        for (let i = 0; i < 10; i++) {
          if (
            !(await withTransaction((client) =>
              deliverNextCartReminder(client, mailer.sendReminder),
            ))
          )
            break;
        }
      }
    } catch {
      console.error("[order-email] Queue unavailable; will retry");
    } finally {
      running = false;
    }
  }
  const timer = setInterval(() => void tick(), 15000);
  timer.unref();
  nitro.hooks.hook("close", () => {
    clearInterval(timer);
    mailer.close();
  });
  void tick();
});
