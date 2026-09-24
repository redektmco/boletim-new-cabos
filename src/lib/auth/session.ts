import "server-only";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

const COOKIE_NAME = "nc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Defina SESSION_SECRET (mínimo 32 caracteres) nas variáveis de ambiente.");
    }
    return new TextEncoder().encode("dev-only-insecure-session-secret-0000000000");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: Pick<User, "id" | "sessionVersion">) {
  const token = await new SignJWT({ v: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;

/** Usuário da sessão atual, conferido no banco (usuário removido ou senha trocada = sessão inválida). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) return null;
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!user || user.sessionVersion !== payload.v) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch {
    return null;
  }
});

/** Use no topo de toda página e Server Action do painel. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin");
  return user;
}
