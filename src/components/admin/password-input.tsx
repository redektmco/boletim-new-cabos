"use client";

import { Eye, EyeOff, WandSparkles } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { inputClass } from "./ui/field";

const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Senha aleatória de 12 caracteres, sem letras ambíguas (l, I, O, 0). */
export function generatePassword(length = 12) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Mostra o botão "Gerar" (preenche com uma senha aleatória e a exibe). */
  onGenerate?: (password: string) => void;
};

export function PasswordInput({ onGenerate, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <input {...rest} type={visible ? "text" : "password"} className={`${inputClass} pr-11 ${className ?? ""}`} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {onGenerate ? (
        <button
          type="button"
          onClick={() => {
            onGenerate(generatePassword());
            setVisible(true);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-white px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-navy-50 hover:text-ink"
        >
          <WandSparkles className="size-4" aria-hidden="true" />
          Gerar
        </button>
      ) : null}
    </div>
  );
}
