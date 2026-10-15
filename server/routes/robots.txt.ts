/**
 * GET /robots.txt
 * public/robots.txt içeriğini sunar (TanStack Start SPA router'ı statik dosyayı engeller).
 */
import { defineEventHandler, setResponseHeader } from "h3";
import { readPublicText } from "../utils/readPublicText";

const FALLBACK = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://minatoi.com/sitemap.xml
`;

export default defineEventHandler(async (event) => {
  const body = await readPublicText("robots.txt", FALLBACK);
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=86400");
  return body;
});
