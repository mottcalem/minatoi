import { defineEventHandler, getRequestURL, setResponseHeader } from "h3";

export default defineEventHandler((event) => {
  if (/^\/admin(?:\/|$)/.test(getRequestURL(event).pathname)) {
    setResponseHeader(event, "X-Robots-Tag", "noindex, nofollow, noarchive");
  }
});
