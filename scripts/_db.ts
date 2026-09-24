import { existsSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/db/schema";

// Scripts rodam fora do Next: carregam o .env.local manualmente (as variáveis já definidas têm prioridade).
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/boletim.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });
export { schema };
