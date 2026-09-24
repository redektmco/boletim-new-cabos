"use client";

import { clsx } from "clsx";
import { TriangleAlert } from "lucide-react";
import { useWatch } from "react-hook-form";
import { MovementIcon, PRESSURE_STYLES } from "@/components/bulletin/pressure";
import { movementOf, pressureOf, variation } from "@/lib/bulletin/calc";
import { formatDayMonth, formatPercent } from "@/lib/bulletin/format";
import type { MetricKey } from "@/lib/bulletin/labels";
import type { FormValues } from "./sections";

const PRESSURE_TEXT = {
  alta: "pressão de alta no preço",
  baixa: "pressão de baixa no preço",
  neutro: "sem pressão relevante no preço",
} as const;

/** Variação semanal calculada ao vivo, com a cor do efeito sobre o preço do cabo. */
export function VariationHint({ metric }: { metric: MetricKey }) {
  const [value, previous, previousDate] = useWatch<FormValues, [`${MetricKey}.value`, `${MetricKey}.previous`, "stocks.previousDate"]>({
    name: [`${metric}.value`, `${metric}.previous`, "stocks.previousDate"],
  });
  const change = variation(value as number | undefined, previous as number | null | undefined);

  if (change == null) {
    return (
      <p className="rounded-xl bg-wash px-3.5 py-2.5 text-sm text-muted">
        Preencha o valor atual e o da semana anterior para ver a variação.
      </p>
    );
  }

  const movement = movementOf(change);
  const pressure = pressureOf(metric, movement);
  const comparison =
    metric === "stocks" && typeof previousDate === "string" && previousDate
      ? `vs. ${formatDayMonth(previousDate)}`
      : "vs. semana anterior";
  const unusual = Math.abs(change) >= 15;

  return (
    <div className="space-y-2" aria-live="polite">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold tabular-nums ring-1 ring-inset",
            PRESSURE_STYLES[pressure],
          )}
        >
          <MovementIcon movement={movement} className="size-3.5" />
          {formatPercent(change)}
        </span>
        <span className="text-ink-2">{comparison}</span>
        <span className="text-muted">· {PRESSURE_TEXT[pressure]}</span>
      </p>
      {unusual ? (
        <p className="flex items-start gap-1.5 text-[0.8125rem] leading-snug text-copper-700">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Variação acima de 15%. Confira se o valor foi digitado corretamente (use vírgula para os centavos).
        </p>
      ) : null}
    </div>
  );
}
