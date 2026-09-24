import { clsx } from "clsx";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** Estilo comum dos campos. 16px no celular evita o zoom automático do iOS ao focar. */
export const inputClass = clsx(
  "block w-full min-w-0 rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink shadow-xs transition-[border-color,box-shadow] sm:text-[0.9375rem]",
  "placeholder:text-muted/70 hover:border-navy-600/35",
  "focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 focus:outline-none",
  "aria-invalid:border-up aria-invalid:bg-up-bg/40 aria-invalid:focus:ring-up/15",
  "disabled:cursor-not-allowed disabled:bg-wash disabled:text-muted",
);

export const labelClass = "block text-sm font-semibold text-ink";

type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Contador de caracteres ou outro detalhe alinhado à direita do rótulo. */
  aside?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Rótulo + campo + dica + erro. O campo deve usar `aria-describedby={describedBy(id, …)}`. */
export function FieldShell({ id, label, hint, error, aside, optional, className, children }: FieldShellProps) {
  return (
    <div className={clsx("min-w-0", className)}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
          {optional ? <span className="ml-1 font-normal text-muted">(opcional)</span> : null}
        </label>
        {aside}
      </div>
      {children}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] leading-snug font-medium text-up-ink">
      <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function describedBy(id: string, { error, hint }: { error?: unknown; hint?: unknown }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function CharCount({ value, max }: { value: string | undefined; max: number }) {
  const length = value?.length ?? 0;
  return (
    <span
      className={clsx(
        "shrink-0 text-xs tabular-nums",
        length > max ? "font-semibold text-up-ink" : length > max * 0.9 ? "font-medium text-copper-600" : "text-muted",
      )}
      aria-label={`${length} de ${max} caracteres`}
    >
      {length}/{max}
    </span>
  );
}
