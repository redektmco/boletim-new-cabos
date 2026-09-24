"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/auth/password";
import { createSession, requireUser } from "@/lib/auth/session";
import { minutesUntil, passwordChangeLimiter } from "@/lib/admin/rate-limit";
import { userFacingError, type ActionResult } from "@/lib/admin/result";
import { zodErrorPtBR } from "@/lib/admin/zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function updateProfileAction(input: { name: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(1, "Informe seu nome.").max(80, "Nome longo demais (máximo de 80 caracteres).") })
    .safeParse(input, { error: zodErrorPtBR });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await db.update(users).set({ name: parsed.data.name, updatedAt: new Date() }).where(eq(users.id, user.id));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao atualizar perfil", error);
    return { ok: false, error: userFacingError(error) };
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual.").max(200),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `A nova senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
      .max(200, "Senha longa demais."),
    confirmPassword: z.string().max(200),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "A confirmação não confere com a nova senha.", path: ["confirmPassword"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "A nova senha precisa ser diferente da atual.", path: ["newPassword"] });

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(input, { error: zodErrorPtBR });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const key = String(user.id);
  const limited = passwordChangeLimiter.check(key);
  if (!limited.ok) {
    return { ok: false, error: `Muitas tentativas. Aguarde ${minutesUntil(limited.retryAfterMs)} minuto(s) e tente novamente.` };
  }

  try {
    const row = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    if (!row) return { ok: false, error: "Usuário não encontrado." };
    if (!(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
      passwordChangeLimiter.hit(key);
      return { ok: false, error: "A senha atual está incorreta." };
    }
    passwordChangeLimiter.reset(key);
    const sessionVersion = row.sessionVersion + 1;
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.newPassword), sessionVersion, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    // Encerra as sessões nos outros aparelhos e mantém esta.
    await createSession({ id: row.id, sessionVersion });
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao trocar senha", error);
    return { ok: false, error: userFacingError(error) };
  }
}
