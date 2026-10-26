import { createCartReminderAPI } from "./cartReminderAPI";
import { getPool, withTransaction } from "../utils/database";
import { readProducts } from "../utils/productStore";
import { readPromotions } from "../utils/promotionStore";
import { catalogProducts } from "../../src/data/catalog";
import { CUSTOM_PRODUCTS } from "../../src/data/customProducts";
import { priceCart } from "../payments/core";
import { orderUploadStore } from "../design/orderUploads";
export const cartReminderAPI = createCartReminderAPI({
  env: process.env,
  getPool,
  withTransaction,
  priceItems: async (items, coupon) => {
    const priced = priceCart(
      items,
      catalogProducts(await readProducts(), CUSTOM_PRODUCTS).storefront,
      await readPromotions(),
      coupon,
    );
    return orderUploadStore.hydrate(priced.items);
  },
});
