import { createPaymentAPI } from "./api";
import { getPool, withTransaction } from "../utils/database";
import { readProducts } from "../utils/productStore";
export const paymentAPI = createPaymentAPI({
  getPool,
  withTransaction,
  readProducts,
  fetch: globalThis.fetch,
  env: process.env,
});
