import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { resolveDatabase } from "./config";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { libsql?: ReturnType<typeof createClient> };

// Reaproveita a conexão entre recarregamentos do `next dev`.
const { url, authToken } = resolveDatabase();
const client = globalForDb.libsql ?? createClient({ url, authToken });
if (process.env.NODE_ENV !== "production") globalForDb.libsql = client;

export const db = drizzle(client, { schema });
export { schema };
