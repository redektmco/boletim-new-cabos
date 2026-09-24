"use client";

import { useState, type ComponentProps, type Ref } from "react";
import { formatNumber, parseDecimal } from "@/lib/bulletin/format";

type DecimalInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "onBlur" | "type" | "ref"> & {
  value: number | null | undefined;
  onChange: (value: number | null | undefined) => void;
  onBlur?: () => void;
  /** Casas decimais exibidas (e usadas para arredondar o valor salvo). */
  decimals: number;
  /** Campo vazio vira `null` (ex.: valor da semana anterior) em vez de `undefined`. */
  nullable?: boolean;
  ref?: Ref<HTMLInputElement>;
};

const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * Campo numérico no formato brasileiro: aceita "14.529,00", "14529,00" ou "14529.00".
 * Enquanto a pessoa digita, mostra exatamente o que ela escreveu; ao sair do campo, mostra formatado.
 * O formulário recebe sempre um número (NaN quando o texto não é um número, para o zod acusar o erro).
 */
export function DecimalInput({ value, onChange, onBlur, decimals, nullable, ref, onFocus, ...rest }: DecimalInputProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const formatted = isFiniteNumber(value) ? formatNumber(value, decimals) : "";
  // Texto inválido (NaN) continua visível depois do blur, para a pessoa corrigir.
  const display = focused || (typeof value === "number" && Number.isNaN(value)) ? text : formatted;

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={display}
      onFocus={(e) => {
        if (isFiniteNumber(value)) setText(formatted);
        setFocused(true);
        onFocus?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (!raw.trim()) {
          onChange(nullable ? null : undefined);
          return;
        }
        const parsed = parseDecimal(raw);
        onChange(parsed == null ? Number.NaN : Number(parsed.toFixed(decimals)));
      }}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
    />
  );
}
