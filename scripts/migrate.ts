import { mkdirSync } from "node:fs";
import { count } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/auth/password";
import { seedEditions } from "./seed-lib";
import { client, db, demo, schema, url } from "./_db";

/**
 * Roda no `npm run build`:
 * 1. aplica as migrações;
 * 2. no primeiro uso (nenhum usuário), cria o administrador de ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD
 *    e publica a edição de 18/09/2026 como primeira edição;
 * 3. no modo demonstração (Vercel sem banco configurado), popula o arquivo local com o histórico de exemplo.
 */
async function main() {
  if (demo) {
    console.warn(
      [
        "",
        "! MODO DEMONSTRAÇÃO — nenhum banco de dados configurado (DATABASE_URL / TURSO_DATABASE_URL).",
        "  O site será publicado com dados de exemplo, somente leitura: o painel não conseguirá salvar.",
        "  Para ativar a gravação, conecte o Turso em Vercel → Storage → Turso Cloud e faça o redeploy.",
        "",
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
  if (total === 0) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? "";
    if (email && password.length >= PASSWORD_MIN_LENGTH) {
      await db.insert(schema.users).values({
        name: process.env.ADMIN_NAME?.trim() || "Administrador",
        email,
        passwordHash: await hashPassword(password),
        role: "admin",
      });
      console.log(`✓ Administrador criado: ${email}`);

      // Banco recém-criado: já publica a edição real de 18/09 para o site não nascer vazio.
      const { inserted } = await seedEditions(db, { includeDemo: false });
      if (inserted) console.log("✓ Primeira edição (18/09/2026) publicada");
    } else {
      console.warn(
        `! Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD (mín. ${PASSWORD_MIN_LENGTH} caracteres) ` +
          "e rode novamente, ou use `npm run user:create`.",
      );
    }
  }

  if (demo) {
    const { inserted } = await seedEditions(db, { includeDemo: true });
    console.log(`✓ Dados de demonstração: ${inserted} edição(ões) inserida(s)`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? `\n✗ ${err.message}\n` : err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
