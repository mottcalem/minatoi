/**
 * Supabase REST API client — fetch tabanlı, ekstra bağımlılık yok.
 * Hem SSR hem client-side'da çalışır.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const HEADERS = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

export async function supabaseSelect<T = unknown>(
  table: string,
  opts: { order?: { column: string; ascending?: boolean } } = {},
): Promise<T[]> {
  let path = `/rest/v1/${table}?select=*`;
  if (opts.order) {
    const dir = opts.order.ascending === false ? "desc" : "asc";
    path += `&order=${opts.order.column}.${dir}`;
  }
  const res = await fetch(`${url}${path}`, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[supabaseSelect] ${table} ${res.status}:`, body);
    return [];
  }
  return (await res.json()) as T[];
}

export async function supabaseInsert<T = unknown>(
  table: string,
  rows: T[],
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `${res.status}: ${body}` };
  }
  return { ok: true };
}

export async function supabaseDeleteAll(
  table: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${url}/rest/v1/${table}?slug=neq.__impossible__`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `${res.status}: ${body}` };
  }
  return { ok: true };
}
