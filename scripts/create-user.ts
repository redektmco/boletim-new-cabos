import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/auth/password";
import { client, db, schema } from "./_db";

/**
 * Cria (ou redefine a senha de) um usuário do painel.
 *   npm run user:create -- --email ana@newcabos.com.br --name "Ana" --password "senha-forte" [--admin]
 */
async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
      admin: { type: "boolean", default: false },
    },
  });
  const email = values.email?.trim().toLowerCase();
  const password = values.password ?? "";
  if (!email || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Informe --email e --password (mín. ${PASSWORD_MIN_LENGTH} caracteres).`);
  }

  const passwordHash = await hashPassword(password);
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) {
    await db
      .update(schema.users)
      .set({
        passwordHash,
        sessionVersion: existing.sessionVersion + 1,
        ...(values.name ? { name: values.name } : {}),
        ...(values.admin ? { role: "admin" as const } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, existing.id));
    console.log(`✓ Senha redefinida para ${email}`);
    return;
  }
  await db.insert(schema.users).values({
    email,
    name: values.name?.trim() || email.split("@")[0],
    passwordHash,
    role: values.admin ? "admin" : "editor",
  });
  console.log(`✓ Usuário criado: ${email}${values.admin ? " (administrador)" : ""}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
