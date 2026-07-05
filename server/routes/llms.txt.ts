/**
 * GET /llms.txt
 * llm.txt ile aynı içerik (llms.txt.org konvansiyonu).
 */
import { defineEventHandler, setResponseHeader } from "h3";
import { readPublicText } from "../utils/readPublicText";

export default defineEventHandler(async (event) => {
  const body = await readPublicText("llm.txt", "");
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=86400");
  return body;
});
