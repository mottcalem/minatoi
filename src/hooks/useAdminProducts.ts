/**
 * Ürün listesini /api/products endpoint'inden çeker.
 * Admin panel kayıt ettiğinde aynı endpoint'e yazar → sunucuda products.json güncellenir
 * → tüm ziyaretçiler yenilediğinde güncel listeyi görür.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchProducts } from "@/data/adminProducts";
import type { Product, Category } from "@/data/products";

export function useProducts(category?: Category): Product[] {
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    const all = await fetchProducts();
    setProducts(category ? all.filter((p) => p.category === category) : all);
  }, [category]);

  useEffect(() => {
    load();
    // Admin panel kayıt ettiğinde diğer sekmeleri/bileşenleri tetikle
    window.addEventListener("products-saved", load);
    return () => window.removeEventListener("products-saved", load);
  }, [load]);

  return products;
}

export function useProduct(slug: string): Product | undefined {
  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    fetchProducts().then((all) => setProduct(all.find((p) => p.slug === slug)));

    function onSave() {
      fetchProducts().then((all) => setProduct(all.find((p) => p.slug === slug)));
    }
    window.addEventListener("products-saved", onSave);
    return () => window.removeEventListener("products-saved", onSave);
  }, [slug]);

  return product;
}
