import { getPool } from "./database";
import { validSession } from "../admin/accounts";
/** Her yönetici için ayrı, süreli ve iptal edilebilir sunucu oturumu. */
export async function isAdminToken(token: string): Promise<boolean> {
  return validSession(getPool(), token);
}
