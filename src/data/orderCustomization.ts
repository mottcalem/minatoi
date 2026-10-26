export type OrderCustomization = {
  uploadId: string;
  orientation: string;
  style: string;
  filename: string;
  photoUrl: string;
};
export function requiresCustomization(product: { category?: string; customization?: unknown }) {
  return (
    Boolean(product.customization) ||
    ["patili-dostalara-ozel", "patili", "kisiye-ozel"].includes(product.category ?? "")
  );
}
export function cartPayload(
  items: { slug: string; size: string; quantity: number; customization?: { uploadId: string } }[],
) {
  return items.map(({ slug, size, quantity, customization }) => ({
    slug,
    size,
    quantity,
    ...(customization ? { customization: { uploadId: customization.uploadId } } : {}),
  }));
}
