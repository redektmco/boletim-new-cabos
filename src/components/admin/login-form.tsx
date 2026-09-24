"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/admin/(auth)/login/actions";
import { Button } from "./ui/button";
import { FieldError, inputClass, labelClass } from "./ui/field";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          placeholder="voce@newcabos.com.br"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
          className={`${inputClass} mt-1.5`}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div aria-live="polite" className="min-h-0">
        {state.error ? (
          <div role="alert" className="rounded-xl border border-up-line bg-up-bg px-3.5 py-2.5">
            <FieldError id="login-error">{state.error}</FieldError>
          </div>
        ) : null}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={pending} icon={<LogIn className="size-4" aria-hidden="true" />} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
