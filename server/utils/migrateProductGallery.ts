import { withTransaction } from "./database";
import { readProductGallery } from "./productGalleryStore";

/** Move the legacy shared image into each product once, preserving later edits. */
export async function migrateProductGallery() {
  const { image } = await readProductGallery();
  await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(7070150912)");
    const previous = await client.query("SELECT 1 FROM schema_migrations WHERE version = $1", [
      "005_product_owned_gallery",
    ]);
    if (previous.rowCount) return;
    if (image) {
      // A product without gallery rows still needs its cover before the attachment.
      await client.query(`INSERT INTO product_images (product_id, position, image_url)
        SELECT p.id, 0, p.image FROM products p
        WHERE NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)`);
      await client.query(
        `INSERT INTO product_images (product_id, position, image_url)
        SELECT p.id, (SELECT COALESCE(MAX(i.position), -1) + 1 FROM product_images i WHERE i.product_id = p.id), $1
        FROM products p
        WHERE NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.image_url = $1)`,
        [image],
      );
      await client.query("UPDATE products SET images_present = true");
    }
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [
      "005_product_owned_gallery",
    ]);
  });
}
