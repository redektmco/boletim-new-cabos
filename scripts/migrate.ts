import { mkdirSync } from "node:fs";
import { count } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/auth/password";
import { client, db, schema, url } from "./_db";

/**
 * Aplica as migrações e, se ainda não houver usuários, cria o primeiro administrador
 * com ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD. Roda no `npm run build`.
 */
async function main() {
  if (process.env.VERCEL && url.startsWith("file:")) {
    // Na Vercel o disco é efêmero e somente leitura: um arquivo SQLite não guardaria as edições.
    throw new Error(
      [
        "Banco de dados de produção não configurado.",
        "Na Vercel, adicione o Turso em Storage → Marketplace → Turso Cloud e conecte ao projeto",
        "(sem prefixo, criando TURSO_DATABASE_URL e TURSO_AUTH_TOKEN), ou defina DATABASE_URL e",
        "DATABASE_AUTH_TOKEN manualmente. Depois, faça o redeploy. Detalhes no README (Publicando).",
      ].join("\n"),
    );
  }
  if (process.env.VERCEL && (process.env.SESSION_SECRET ?? "").length < 32) {
    console.warn("! SESSION_SECRET ausente ou curto: o site público funciona, mas o login do painel não.");
  }
  if (url.startsWith("file:")) mkdirSync("data", { recursive: true });
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log(`✓ Migrações aplicadas (${url.startsWith("file:") ? url : "banco remoto"})`);

  const [{ total }] = await db.select({ total: count() }).from(schema.users);
  if (total > 0) return;

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < PASSWORD_MIN_LENGTH) {
    console.warn(
      `! Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD (mín. ${PASSWORD_MIN_LENGTH} caracteres) ` +
        "e rode novamente, ou use `npm run user:create`.",
    );
    return;
  }
  await db.insert(schema.users).values({
    name: process.env.ADMIN_NAME?.trim() || "Administrador",
    email,
    passwordHash: await hashPassword(password),
    role: "admin",
  });
  console.log(`✓ Administrador criado: ${email}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? `\n✗ ${err.message}\n` : err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
