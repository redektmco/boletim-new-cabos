import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function databaseConfig() {
  return {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/boletim.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  };
}

const globalForDb = globalThis as unknown as { libsql?: ReturnType<typeof createClient> };

// Reaproveita a conexão entre recarregamentos do `next dev`.
const client = globalForDb.libsql ?? createClient(databaseConfig());
if (process.env.NODE_ENV !== "production") globalForDb.libsql = client;

export const db = drizzle(client, { schema });
export { schema };
