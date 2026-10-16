import { getPool } from "../utils/database";
import { createAdminAPI } from "./api";
export const adminAPI = createAdminAPI(getPool(), process.env);
