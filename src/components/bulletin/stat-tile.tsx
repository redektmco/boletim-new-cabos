import { clsx } from "clsx";
import type { ReactNode } from "react";
import { movementOf, pressureOf, variation } from "@/lib/bulletin/calc";
import { formatPercent } from "@/lib/bulletin/format";
import { PRESSURE_LABEL, type MetricKey } from "@/lib/bulletin/labels";
import { MovementIcon, PRESSURE_STYLES } from "./pressure";
import { Sparkline, type SparkPoint } from "./sparkline";

export type StatTileProps = {
  metric: MetricKey;
  icon: ReactNode;
  name: string;
  unit: string;
  value: number | undefined;
  previous: number | null | undefined;
  format: (value: number) => string;
  dateLabel: string;
  comparisonLabel: string;
  trend: SparkPoint[];
  footer?: ReactNode;
  source?: string;
};

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Indicador do resumo da semana: valor, variação (colorida pelo efeito no preço) e tendência. */
export function StatTile(props: StatTileProps) {
  const { metric, icon, name, unit, value, previous, format, dateLabel, comparisonLabel, trend, footer, source } = props;
  const change = isNumber(value) && isNumber(previous) ? variation(value, previous) : null;
  const movement = movementOf(change);
  const pressure = pressureOf(metric, movement);

  return (
    <section className="card flex flex-col p-5" aria-label={name}>
      <header className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-800 print-keep-color">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[0.95rem] leading-tight font-bold text-navy-800">{name}</h3>
          <p className="text-xs text-muted">{unit}</p>
        </div>
      </header>

      <p className="mt-4 font-display text-[1.75rem] leading-none font-bold tracking-tight text-ink">
        {isNumber(value) ? format(value) : "—"}
      </p>
      <p className="mt-1.5 text-xs text-muted">{dateLabel}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {change == null ? (
          <span className="text-xs text-muted">Sem valor anterior para comparar</span>
        ) : (
          <>
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold ring-1 ring-inset print-keep-color",
                PRESSURE_STYLES[pressure],
              )}
              title={`${PRESSURE_LABEL[pressure]} sobre o preço`}
            >
              <MovementIcon movement={movement} className="size-3.5" />
              {formatPercent(change)}
            </span>
            <span className="text-xs text-muted">{comparisonLabel}</span>
          </>
        )}
      </div>

      <Sparkline points={trend} label={`Tendência de ${name} nas últimas edições`} className="mt-4" />

      {footer ? <div className="mt-4">{footer}</div> : null}
      {source ? <p className="mt-auto pt-4 text-[0.6875rem] text-muted">Fonte: {source}</p> : null}
    </section>
  );
}

export function AveragesTable({
  averages,
  format,
  caption,
}: {
  averages: { label: string; note?: string; value: number }[];
  format: (value: number) => string;
  caption: string;
}) {
  const rows = averages.filter((a) => a.label);
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl bg-wash px-3 py-2.5 print-keep-color">
      <p className="text-[0.6875rem] font-semibold text-ink-2">{caption}</p>
      <dl className="mt-1.5 space-y-1">
        {rows.map((a, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
            <dt className="min-w-0 text-muted">
              {a.label}
              {a.note ? <span className="text-muted/80"> ({a.note})</span> : null}
            </dt>
            <dd className="font-semibold tabular-nums text-ink">{isNumber(a.value) ? format(a.value) : "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
