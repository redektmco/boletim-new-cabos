"use client";

import { KeyRound, Save } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { changePasswordAction, updateProfileAction } from "@/app/admin/(panel)/conta/actions";
import { PasswordInput } from "./password-input";
import { Button } from "./ui/button";
import { FieldError, inputClass, labelClass } from "./ui/field";
import { RoleBadge } from "./ui/status-badge";

const MIN = 8;

export function ProfileForm({ name: initialName, email, role }: { name: string; email: string; role: "admin" | "editor" }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction({ name });
      if (!result.ok) setError(result.error);
      else toast.success("Seus dados foram atualizados.");
    });
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="seus-dados">
      <h2 id="seus-dados" className="section-title text-base">
        Seus dados
      </h2>
      <p className="mt-1 text-sm text-ink-2">O nome aparece como autor sugerido nas novas edições.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="conta-nome" className={labelClass}>
            Nome
          </label>
          <input
            id="conta-nome"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={`${inputClass} mt-1.5`}
          />
        </div>
        <div>
          <p className={labelClass}>E-mail</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.9375rem] text-ink-2">
            {email}
            <RoleBadge role={role} />
          </p>
          <p className="mt-1 text-[0.8125rem] text-muted">Para trocar o e-mail, fale com um administrador.</p>
        </div>
        {error ? (
          <div role="alert">
            <FieldError>{error}</FieldError>
          </div>
        ) : null}
        <Button type="submit" variant="primary" loading={pending} disabled={name.trim() === initialName} icon={<Save className="size-4" aria-hidden="true" />}>
          Salvar
        </Button>
      </form>
    </section>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < MIN) return setError(`A nova senha precisa ter pelo menos ${MIN} caracteres.`);
    if (newPassword !== confirmPassword) return setError("A confirmação não confere com a nova senha.");
    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword, newPassword, confirmPassword });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada.", { description: "Você continua conectado aqui; nos outros aparelhos será preciso entrar de novo." });
    });
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="trocar-senha">
      <h2 id="trocar-senha" className="section-title text-base">
        Trocar senha
      </h2>
      <p className="mt-1 text-sm text-ink-2">Por segurança, confirme sua senha atual.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="senha-atual" className={labelClass}>
            Senha atual
          </label>
          <div className="mt-1.5">
            <PasswordInput
              id="senha-atual"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>
        <div>
          <label htmlFor="senha-nova" className={labelClass}>
            Nova senha
          </label>
          <div className="mt-1.5">
            <PasswordInput
              id="senha-nova"
              required
              minLength={MIN}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              aria-describedby="senha-nova-dica"
            />
          </div>
          <p id="senha-nova-dica" className="mt-1.5 text-[0.8125rem] text-muted">
            Mínimo de {MIN} caracteres.
          </p>
        </div>
        <div>
          <label htmlFor="senha-confirmar" className={labelClass}>
            Confirme a nova senha
          </label>
          <div className="mt-1.5">
            <PasswordInput
              id="senha-confirmar"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        {error ? (
          <div role="alert">
            <FieldError>{error}</FieldError>
          </div>
        ) : null}
        <Button type="submit" variant="primary" loading={pending} icon={<KeyRound className="size-4" aria-hidden="true" />}>
          Trocar senha
        </Button>
      </form>
    </section>
  );
}
