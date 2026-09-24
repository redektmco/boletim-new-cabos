import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/admin/account-forms";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <p className="eyebrow">Configurações</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Minha conta</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
        <ProfileForm key={user.name} name={user.name} email={user.email} role={user.role} />
        <PasswordForm />
      </div>
    </div>
  );
}
