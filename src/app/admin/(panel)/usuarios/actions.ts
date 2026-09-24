"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { createSession, requireAdmin } from "@/lib/auth/session";
import { userFacingError, type ActionResult } from "@/lib/admin/result";
import { zodErrorPtBR } from "@/lib/admin/zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(200, "Senha longa demais.");

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(80, "Nome longo demais (máximo de 80 caracteres)."),
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  password: passwordSchema,
  role: z.enum(["admin", "editor"]),
});

const userIdSchema = z.number().int().positive();

function firstMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createUserAction(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(input, { error: zodErrorPtBR });
  if (!parsed.success) return { ok: false, error: firstMessage(parsed.error) };
  const { name, email, password, role } = parsed.data;

  try {
    const existing = await db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, email) });
    if (existing) return { ok: false, error: "Já existe um usuário com este e-mail." };
    await db.insert(users).values({ name, email, role, passwordHash: await hashPassword(password) });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao criar usuário", error);
    return { ok: false, error: userFacingError(error) };
  }
}

export async function resetUserPasswordAction(input: { userId: number; password: string }): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ userId: userIdSchema, password: passwordSchema }).safeParse(input, { error: zodErrorPtBR });
  if (!parsed.success) return { ok: false, error: firstMessage(parsed.error) };
  const { userId, password } = parsed.data;

  try {
    const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!target) return { ok: false, error: "Usuário não encontrado." };
    const sessionVersion = target.sessionVersion + 1;
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(password), sessionVersion, updatedAt: new Date() })
      .where(eq(users.id, userId));
    // Troca a própria senha por aqui: mantém esta sessão válida.
    if (target.id === admin.id) await createSession({ id: target.id, sessionVersion });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao redefinir senha", error);
    return { ok: false, error: userFacingError(error) };
  }
}

export async function deleteUserAction(input: { userId: number }): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ userId: userIdSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Requisição inválida." };
  const { userId } = parsed.data;
  if (userId === admin.id) return { ok: false, error: "Você não pode remover a si mesmo." };

  try {
    const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!target) return { ok: false, error: "Este usuário já foi removido." };
    if (target.role === "admin") {
      const [{ total }] = await db
        .select({ total: count() })
        .from(users)
        .where(and(eq(users.role, "admin"), ne(users.id, userId)));
      if (total === 0) return { ok: false, error: "É preciso manter pelo menos um administrador." };
    }
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao remover usuário", error);
    return { ok: false, error: userFacingError(error) };
  }
}
