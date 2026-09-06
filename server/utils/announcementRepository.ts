import type { PoolClient } from "pg";

type Database = Pick<PoolClient, "query">;

export const ANNOUNCEMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS announcements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  text text NOT NULL CHECK (length(btrim(text)) > 0 AND length(text) <= 200),
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS announcements_position_idx ON announcements(position, id);
`;

export function validateAnnouncements(data: unknown): asserts data is string[] {
  if (!Array.isArray(data)) throw new Error("Duyuru listesi geçersiz.");
  if (data.length > 20) throw new Error("En fazla 20 duyuru eklenebilir.");
  const seen = new Set<string>();
  for (const item of data) {
    if (typeof item !== "string" || !item.trim()) throw new Error("Duyuru metni boş olamaz.");
    if (item.length > 200) throw new Error("Duyuru metni 200 karakteri aşamaz.");
    if (seen.has(item)) throw new Error("Aynı duyuru metni iki kez eklenemez.");
    seen.add(item);
  }
}

export async function readAnnouncementRows(db: Database): Promise<string[]> {
  const result = await db.query("SELECT text FROM announcements ORDER BY position, id");
  return result.rows.map((row) => row.text as string);
}

// Caller owns the transaction: the full list is replaced atomically (last write wins).
export async function writeAnnouncementRows(db: Database, data: unknown): Promise<void> {
  validateAnnouncements(data);
  await db.query("LOCK TABLE announcements IN SHARE ROW EXCLUSIVE MODE");
  await db.query("DELETE FROM announcements");
  if (data.length) {
    await db.query(
      `INSERT INTO announcements (text, position)
       SELECT value, ordinality - 1 FROM unnest($1::text[]) WITH ORDINALITY AS items(value, ordinality)`,
      [data],
    );
  }
}
