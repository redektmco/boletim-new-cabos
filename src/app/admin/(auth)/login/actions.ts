"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginIpLimiter, loginLimiter, minutesUntil } from "@/lib/admin/rate-limit";
import { clientIp } from "@/lib/admin/request";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(200),
  password: z.string().max(200),
});

const INVALID = "E-mail ou senha incorretos.";

// Hash de referência para comparar mesmo quando o e-mail não existe (tempo de resposta parecido).
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= hashPassword("nenhum-usuario-com-este-email");
  return dummyHash;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") ?? "", password: formData.get("password") ?? "" });
  if (!parsed.success) return { error: INVALID };
  const { email, password } = parsed.data;
  if (!email || !password) return { error: "Informe seu e-mail e sua senha.", email };

  const ip = await clientIp();
  const key = `${email}|${ip}`;
  const limited = [loginLimiter.check(key), loginIpLimiter.check(ip)].find((r) => !r.ok);
  if (limited && !limited.ok) {
    return {
      error: `Muitas tentativas de acesso. Aguarde ${minutesUntil(limited.retryAfterMs)} minuto(s) e tente novamente.`,
      email,
    };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    loginLimiter.hit(key);
    loginIpLimiter.hit(ip);
    return { error: INVALID, email };
  }

  loginLimiter.reset(key);
  try {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  } catch (error) {
    // Banco somente leitura (modo demonstração) não pode impedir o login.
    console.warn("[admin] Não foi possível registrar o último acesso", error);
  }
  await createSession(user);
  redirect("/admin");
}
