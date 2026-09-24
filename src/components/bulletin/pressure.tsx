import { clsx } from "clsx";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { BIAS_LABEL, PRESSURE_LABEL } from "@/lib/bulletin/labels";
import type { Bias, Pressure } from "@/lib/bulletin/schema";
import type { Movement } from "@/lib/bulletin/calc";

export const PRESSURE_STYLES: Record<Pressure, string> = {
  alta: "bg-up-bg text-up-ink ring-up-line",
  baixa: "bg-down-bg text-down-ink ring-down-line",
  neutro: "bg-flat-bg text-flat-ink ring-flat-line",
};

const BIAS_TO_PRESSURE: Record<Bias, Pressure> = { alta: "alta", baixa: "baixa", lateral: "neutro" };

export function MovementIcon({ movement, className }: { movement: Movement; className?: string }) {
  const Icon = movement === "up" ? ArrowUp : movement === "down" ? ArrowDown : Minus;
  return <Icon className={className} aria-hidden="true" strokeWidth={2.5} />;
}

/** Seta + rótulo da pressão sobre o preço (termômetro). Cor nunca aparece sozinha. */
export function PressureTag({ pressure, className }: { pressure: Pressure; className?: string }) {
  const movement: Movement = pressure === "alta" ? "up" : pressure === "baixa" ? "down" : "flat";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 font-medium", className)}>
      <span
        className={clsx(
          "grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-inset print-keep-color",
          PRESSURE_STYLES[pressure],
        )}
      >
        <MovementIcon movement={movement} className="size-3.5" />
      </span>
      <span className="text-ink-2">{PRESSURE_LABEL[pressure]}</span>
    </span>
  );
}

export function BiasPill({ bias, size = "md", className }: { bias: Bias; size?: "sm" | "md" | "lg"; className?: string }) {
  const pressure = BIAS_TO_PRESSURE[bias];
  const movement: Movement = bias === "alta" ? "up" : bias === "baixa" ? "down" : "flat";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset print-keep-color",
        PRESSURE_STYLES[pressure],
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-2 font-display text-base tracking-tight uppercase",
        className,
      )}
    >
      <MovementIcon movement={movement} className={size === "lg" ? "size-4" : "size-3.5"} />
      {BIAS_LABEL[bias]}
    </span>
  );
}
