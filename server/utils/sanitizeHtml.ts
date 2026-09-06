/**
 * Rich text açıklamalar için allowlist tabanlı HTML temizleyici.
 * Yalnızca editörün ürettiği etiket ve nitelikler korunur; script/iframe/stil
 * vb. her şey çıkarılır. Sunucu tarafında kayıt anında çalıştırılır.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "div",
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target"]),
};

/** etiket adı → {keep: nitelikler, dropIçerik: etiketle birlikte içeriği de at} */
type TagToken =
  { type: "text"; value: string } | { type: "tag"; name: string; closing: boolean; attrs: string };

function tokenize(html: string): TagToken[] {
  const tokens: TagToken[] = [];
  const pattern = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g;
  let lastIndex = 0;
  for (const match of html.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) tokens.push({ type: "text", value: html.slice(lastIndex, start) });
    lastIndex = start + match[0].length;
    const raw = match[0];
    if (raw.startsWith("<!--")) continue; // yorumlar tamamen atılır
    const closing = raw.startsWith("</");
    const nameMatch = /<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(raw);
    if (!nameMatch) continue;
    tokens.push({
      type: "tag",
      name: nameMatch[1].toLowerCase(),
      closing,
      attrs: closing ? "" : raw.slice(raw.indexOf(nameMatch[1]) + nameMatch[1].length, -1),
    });
  }
  if (lastIndex < html.length) tokens.push({ type: "text", value: html.slice(lastIndex) });
  return tokens;
}

function sanitizeAttributes(tag: string, attrs: string): string {
  const allowed = ALLOWED_ATTRIBUTES[tag];
  if (!allowed) return "";
  const kept: string[] = [];
  for (const match of attrs.matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const name = match[1].toLowerCase();
    const value = (match[3] ?? match[4] ?? "").replace(/[<>"']/g, "");
    if (!allowed.has(name)) continue;
    if (name === "href" && !/^https?:\/\//i.test(value)) continue;
    kept.push(
      name === "href"
        ? `href="${value}" rel="noopener noreferrer nofollow" target="_blank"`
        : `${name}="${value}"`,
    );
  }
  return kept.length ? ` ${kept.join(" ")}` : "";
}

export function sanitizeRichText(html: string): string {
  const tokens = tokenize(html);
  let output = "";
  const openTags: string[] = [];
  for (const token of tokens) {
    if (token.type === "text") {
      output += token.value;
      continue;
    }
    if (!ALLOWED_TAGS.has(token.name)) {
      // Bilinmeyen etiketler içeriği korunmadan tamamen atılır.
      if (!token.closing && !/^\/?$/.test(token.attrs.slice(-1))) continue;
      continue;
    }
    if (token.name === "br" || token.name === "span" || token.name === "div") {
      if (token.name === "br") {
        output += "<br />";
        continue;
      }
      // span/div sarar ama nitelik taşımaz (style/class temizlenir)
      if (!token.closing) {
        output += "<p>";
        openTags.push("p");
      } else {
        const last = openTags.lastIndexOf("p");
        if (last !== -1) {
          output += "</p>";
          openTags.splice(last, 1);
        }
      }
      continue;
    }
    if (token.closing) {
      const last = openTags.lastIndexOf(token.name);
      if (last !== -1) {
        // kapatılmamış ara etiketleri kapat
        while (openTags.length > last + 1) {
          output += `</${openTags.pop()}>`;
        }
        output += `</${token.name}>`;
        openTags.pop();
      }
      continue;
    }
    output += `<${token.name}${sanitizeAttributes(token.name, token.attrs)}>`;
    openTags.push(token.name);
  }
  while (openTags.length) output += `</${openTags.pop()}>`;
  return output;
}
