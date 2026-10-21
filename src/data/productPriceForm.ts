type PriceFields = { price: string; oldPrice: string; sizePrices: string };

/** The product's displayed starting price follows its first size option. */
export function syncProductPriceFields<T extends PriceFields>(
  form: T,
  key: keyof T,
  value: string,
): T {
  const next = { ...form, [key]: value };
  if (key === "sizePrices") {
    const first = value.trim().split("\n")[0];
    if (first?.includes("|")) {
      const [, price, oldPrice] = first.split("|").map((part) => part.trim());
      next.price = price ?? "";
      next.oldPrice = oldPrice ?? "";
    }
  } else if ((key === "price" || key === "oldPrice") && form.sizePrices.trim()) {
    let updated = false;
    next.sizePrices = form.sizePrices.split("\n").map((line) => {
      if (updated || !line.trim()) return line;
      updated = true;
      const [size] = line.split("|");
      return `${size.trim()} | ${next.price} | ${next.oldPrice}`;
    }).join("\n");
  }
  return next;
}
