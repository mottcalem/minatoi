/**
 * GET /llm.txt
 * Yapay zeka modelleri için site özeti (GEO).
 */
import { defineEventHandler, setResponseHeader } from "h3";
import { readPublicText } from "../utils/readPublicText";

export default defineEventHandler(async (event) => {
  const body = await readPublicText("llm.txt", "");
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=86400");
  return body;
});
