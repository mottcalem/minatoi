import { createOrderUploadAPI } from "./orderUploads";
import { readProducts } from "../utils/productStore";
import { catalogProducts } from "../../src/data/catalog";
import { CUSTOM_PRODUCTS } from "../../src/data/customProducts";
export const orderUploadAPI = createOrderUploadAPI(
  process.env,
  async () => catalogProducts(await readProducts(), CUSTOM_PRODUCTS).storefront,
);
