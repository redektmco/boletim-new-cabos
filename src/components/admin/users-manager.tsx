"use client";

import { KeyRound, Trash, UserPlus } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { createUserAction, deleteUserAction, resetUserPasswordAction } from "@/app/admin/(panel)/usuarios/actions";
import { Segmented } from "./ui/segmented";
import { PasswordInput } from "./password-input";
import { Button } from "./ui/button";
import { useConfirm } from "./ui/confirm";
import { Dialog } from "./ui/dialog";
import { FieldError, inputClass, labelClass } from "./ui/field";
import { RoleBadge } from "./ui/status-badge";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  lastLoginLabel: string;
  createdLabel: string;
};

const MIN = 8;

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: number }) {
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section className="card" aria-labelledby="lista-usuarios">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="lista-usuarios" className="section-title text-base">
            Quem tem acesso
          </h2>
          <span className="text-sm text-muted">{users.length === 1 ? "1 usuário" : `${users.length} usuários`}</span>
        </div>
        <ul className="divide-y divide-line">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              isLastAdmin={user.role === "admin" && adminCount <= 1}
              onResetPassword={() => setResetTarget(user)}
            />
          ))}
        </ul>
      </section>

      <CreateUserForm />

      <ResetPasswordDialog user={resetTarget} isSelf={resetTarget?.id === currentUserId} onClose={() => setResetTarget(null)} />
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function UserItem({
  user,
  isSelf,
  isLastAdmin,
  onResetPassword,
}: {
  user: UserRow;
  isSelf: boolean;
  isLastAdmin: boolean;
  onResetPassword: () => void;
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const cannotRemove = isSelf ? "Você não pode remover a si mesmo." : isLastAdmin ? "É preciso manter pelo menos um administrador." : null;

  const remove = async () => {
    const ok = await confirm({
      title: `Remover ${user.name}?`,
      description: `${user.email} perde o acesso ao painel imediatamente. As edições feitas por essa pessoa continuam publicadas.`,
      confirmLabel: "Remover usuário",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteUserAction({ userId: user.id });
      if (!result.ok) toast.error(result.error);
      else toast.success(`${user.name} foi removido(a).`);
    });
  };

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center" aria-busy={pending || undefined}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-800 font-display text-sm font-bold text-white" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-ink">{user.name}</span>
            {isSelf ? <span className="text-xs text-muted">(você)</span> : null}
            <RoleBadge role={user.role} />
          </p>
          <p className="truncate text-sm text-ink-2">{user.email}</p>
          <p className="mt-0.5 text-xs text-muted">Último acesso: {user.lastLoginLabel}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="secondary" onClick={onResetPassword} icon={<KeyRound className="size-3.5" aria-hidden="true" />}>
          Redefinir senha
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={remove}
          loading={pending}
          disabled={!!cannotRemove}
          title={cannotRemove ?? undefined}
          aria-label={`Remover ${user.name}`}
          icon={<Trash className="size-3.5" aria-hidden="true" />}
          className="text-up-ink hover:bg-up-bg hover:text-up-ink disabled:text-muted/50 disabled:hover:bg-transparent"
        >
          Remover
        </Button>
      </div>
    </li>
  );
}

function CreateUserForm() {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN) {
      setError(`A senha precisa ter pelo menos ${MIN} caracteres.`);
      return;
    }
    startTransition(async () => {
      const result = await createUserAction({ name, email, password, role });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(`${name.trim()} já pode entrar no painel.`, {
        description: "Envie o e-mail e a senha para a pessoa por um canal seguro.",
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("editor");
    });
  };

  return (
    <section className="card p-5" aria-labelledby="novo-usuario">
      <h2 id="novo-usuario" className="section-title flex items-center gap-2 text-base">
        <UserPlus className="size-5 text-navy-700" aria-hidden="true" />
        Adicionar usuário
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="novo-nome" className={labelClass}>
            Nome
          </label>
          <input id="novo-nome" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-1.5`} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="novo-email" className={labelClass}>
            E-mail
          </label>
          <input
            id="novo-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1.5`}
            autoComplete="off"
            placeholder="nome@newcabos.com.br"
          />
        </div>
        <div>
          <label htmlFor="novo-senha" className={labelClass}>
            Senha inicial
          </label>
          <div className="mt-1.5">
            <PasswordInput
              id="novo-senha"
              required
              minLength={MIN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onGenerate={setPassword}
              autoComplete="new-password"
              aria-describedby="novo-senha-dica"
            />
          </div>
          <p id="novo-senha-dica" className="mt-1.5 text-[0.8125rem] text-muted">
            Mínimo de {MIN} caracteres. A pessoa pode trocar depois em “Minha conta”.
          </p>
        </div>
        <div>
          <p id="novo-papel" className={labelClass}>
            Permissão
          </p>
          <Segmented
            labelledBy="novo-papel"
            value={role}
            onChange={setRole}
            className="mt-1.5 w-full"
            options={[
              { value: "editor", label: "Editor" },
              { value: "admin", label: "Administrador" },
            ]}
          />
          <p className="mt-1.5 text-[0.8125rem] text-muted">
            {role === "editor"
              ? "Cria, edita e publica edições do boletim."
              : "Tudo o que o editor faz, e também gerencia usuários."}
          </p>
        </div>
        {error ? (
          <div role="alert">
            <FieldError>{error}</FieldError>
          </div>
        ) : null}
        <Button type="submit" variant="primary" loading={pending} className="w-full" icon={<UserPlus className="size-4" aria-hidden="true" />}>
          Adicionar usuário
        </Button>
      </form>
    </section>
  );
}

function ResetPasswordDialog({ user, isSelf, onClose }: { user: UserRow | null; isSelf: boolean; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (password.length < MIN) {
      setError(`A senha precisa ter pelo menos ${MIN} caracteres.`);
      return;
    }
    startTransition(async () => {
      const result = await resetUserPasswordAction({ userId: user.id, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(`Senha de ${user.name} redefinida.`, {
        description: isSelf ? undefined : "As sessões abertas dessa pessoa foram encerradas.",
      });
      close();
    });
  };

  return (
    <Dialog
      open={user !== null}
      onClose={close}
      title={user ? `Redefinir a senha de ${user.name}` : ""}
      description={
        isSelf
          ? "Sua sessão continua ativa neste navegador; nos outros aparelhos será preciso entrar de novo."
          : "A pessoa será desconectada de todos os aparelhos e precisará entrar com a nova senha."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="redefinir-senha" className={labelClass}>
            Nova senha
          </label>
          <div className="mt-1.5">
            <PasswordInput
              id="redefinir-senha"
              data-autofocus
              required
              minLength={MIN}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onGenerate={setPassword}
              autoComplete="new-password"
            />
          </div>
          {error ? <FieldError>{error}</FieldError> : <p className="mt-1.5 text-[0.8125rem] text-muted">Mínimo de {MIN} caracteres.</p>}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pending} icon={<KeyRound className="size-4" aria-hidden="true" />}>
            Salvar nova senha
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
