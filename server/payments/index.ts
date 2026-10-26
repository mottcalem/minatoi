import { orderUploadStore } from "../design/orderUploads";
import { catalogProducts } from "../../src/data/catalog";
import { CUSTOM_PRODUCTS } from "../../src/data/customProducts";
import { isAdminToken } from "../utils/adminAuth";
import { queueOrderEmails } from "../notifications/queue";
import { readPromotions } from "../utils/promotionStore";
import { createPaymentAPI } from "./api";
import { getPool, withTransaction } from "../utils/database";
import { readProducts } from "../utils/productStore";
export const paymentAPI = createPaymentAPI({
  authorizeAdmin: isAdminToken,
  queueOrderEmails,
  readPromotions,
  getPool,
  withTransaction,
  readProducts: async () => catalogProducts(await readProducts(), CUSTOM_PRODUCTS).storefront,
  hydrateOrderItems: (items) => orderUploadStore.hydrate(items),
  fetch: globalThis.fetch,
  env: process.env,
});
