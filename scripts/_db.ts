import { existsSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { resolveDatabase } from "../src/lib/db/config";
import * as schema from "../src/lib/db/schema";

// Scripts rodam fora do Next: carregam o .env.local manualmente (as variáveis já definidas têm prioridade).
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export const { url, demo } = resolveDatabase();
export const client = createClient({ url, authToken: resolveDatabase().authToken });
export const db = drizzle(client, { schema });
export { schema };
