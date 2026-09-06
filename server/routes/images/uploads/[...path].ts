/**
 * GET /images/uploads/**
 * Yönetim panelinden sonradan yüklenen görselleri diskten servis eder.
 * Nitro üretim build'inde statik dosyalar build anındaki manifestten
 * servis edildiği için sonradan eklenenler 404 alır; bu route o dosyaları
 * hem geliştirme hem üretimde doğrudan diskten sunar.
 */
import { defineEventHandler, setResponseHeader, createError } from "h3";
import { readUploadedImage } from "../../../utils/readUploadedImage";

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path ?? "";
  const image = await readUploadedImage(`/images/uploads/${path}`);
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: "Görsel bulunamadı" });
  }
  setResponseHeader(event, "Content-Type", image.contentType);
  setResponseHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  return image.body;
});
