import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { UsersManager, type UserRow } from "@/components/admin/users-manager";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/admin/format";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Usuários",
};

export default async function UsersPage() {
  const admin = await requireAdmin();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.name));

  const list: UserRow[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    lastLoginLabel: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "nunca entrou",
    createdLabel: formatDateTime(u.createdAt),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <p className="eyebrow">Administração</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Usuários</h1>
      <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-2">
        Quem pode entrar no painel para criar e publicar o boletim. Só administradores veem esta página.
      </p>
      <div className="mt-6">
        <UsersManager users={list} currentUserId={admin.id} />
      </div>
    </div>
  );
}
