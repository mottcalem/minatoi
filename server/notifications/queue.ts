import type { PoolClient } from "pg";
import type { Audience, EmailOrder } from "./messages.ts";
export const EMAIL_SCHEMA = `CREATE TABLE IF NOT EXISTS order_email_outbox (
 order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 audience text NOT NULL CHECK(audience IN ('customer','admin')),
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz, last_error text, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(order_id,audience)
); CREATE INDEX IF NOT EXISTS order_email_pending_idx ON order_email_outbox(next_attempt_at) WHERE sent_at IS NULL;`;
export async function queueOrderEmails(client: Pick<PoolClient, "query">, orderId: string) {
  await client.query(
    `INSERT INTO order_email_outbox(order_id,audience) VALUES ($1,'customer'),($1,'admin') ON CONFLICT DO NOTHING`,
    [orderId],
  );
}
export async function deliverNextEmail(
  client: Pick<PoolClient, "query">,
  send: (order: EmailOrder, audience: Audience) => Promise<void>,
) {
  const result =
    await client.query(`SELECT q.order_id,q.audience,o.id,o.customer,o.items,o.amount,o.discount,o.test_mode
    FROM order_email_outbox q JOIN orders o ON o.id=q.order_id
    WHERE q.sent_at IS NULL AND q.next_attempt_at<=now() AND o.status='paid'
    ORDER BY q.next_attempt_at LIMIT 1 FOR UPDATE OF q SKIP LOCKED`);
  const row = result.rows[0];
  if (!row) return false;
  try {
    await send(row, row.audience);
  } catch (error) {
    // Store only a short error code; SMTP errors can contain private message details.
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
            .replace(/[^A-Z0-9_]/gi, "")
            .slice(0, 40)
        : "SMTP_ERROR";
    await client.query(
      `UPDATE order_email_outbox SET attempts=attempts+1,last_error=$3,
      next_attempt_at=now()+LEAST(3600,30*power(2,LEAST(attempts,7))) * interval '1 second'
      WHERE order_id=$1 AND audience=$2`,
      [row.order_id, row.audience, code],
    );
    console.error("[order-email] Delivery deferred", row.order_id, row.audience, code);
    return true;
  }
  await client.query(
    "UPDATE order_email_outbox SET sent_at=now(),attempts=attempts+1,last_error=NULL WHERE order_id=$1 AND audience=$2",
    [row.order_id, row.audience],
  );
  console.info("[order-email] Sent", row.order_id, row.audience);
  return true;
}
