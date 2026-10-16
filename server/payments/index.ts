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
  readProducts,
  fetch: globalThis.fetch,
  env: process.env,
});
