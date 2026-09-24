"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { variation } from "@/lib/bulletin/calc";
import {
  formatCopper,
  formatDateShort,
  formatDayMonth,
  formatDollar,
  formatNumber,
  formatPercent,
  formatTonnes,
} from "@/lib/bulletin/format";
import { BIAS_SHORT, METRIC_LABEL, type MetricKey } from "@/lib/bulletin/labels";
import type { HistoryPoint } from "@/lib/bulletin/types";
import { DeltaBadge } from "./delta-badge";

const METRICS: { key: MetricKey; label: string; color: string; format: (v: number) => string; tick: (v: number) => string }[] = [
  { key: "copper", label: "Cobre LME", color: "#c56a2c", format: formatCopper, tick: (v) => formatNumber(v, 0) },
  { key: "dollar", label: "Dólar", color: "#0a3a7c", format: formatDollar, tick: (v) => formatNumber(v, 2) },
  { key: "stocks", label: "Estoques LME", color: "#1479f6", format: formatTonnes, tick: (v) => `${formatNumber(v / 1000, 0)} mil` },
];

const RANGES = [
  { key: "12", label: "Últimas 12" },
  { key: "all", label: "Todas" },
] as const;

const HEIGHT = 300;
const MARGIN = { top: 20, right: 20, bottom: 34, left: 64 };

function niceTicks(min: number, max: number, count = 5) {
  if (min === max) {
    const pad = Math.abs(min) * 0.01 || 1;
    min -= pad;
    max += pad;
  }
  const rawStep = (max - min) / (count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * magnitude;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

export function HistoryChart({ points }: { points: HistoryPoint[] }) {
  const router = useRouter();
  const [metricKey, setMetricKey] = useState<MetricKey>("copper");
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("12");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [active, setActive] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [view]);

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const data = useMemo(() => (range === "12" ? points.slice(-12) : points), [points, range]);
  const values = data.map((p) => p[metricKey]);

  const stats = useMemo(() => {
    if (values.length === 0) return null;
    const first = values[0];
    const last = values[values.length - 1];
    return { last, change: variation(last, first), min: Math.min(...values), max: Math.max(...values) };
  }, [values]);

  const ticks = values.length ? niceTicks(Math.min(...values), Math.max(...values)) : [];
  const yMin = ticks[0] ?? 0;
  const yMax = ticks[ticks.length - 1] ?? 1;
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (i: number) => MARGIN.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => MARGIN.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH;

  const line = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p[metricKey]).toFixed(1)}`).join(" ");
  const area = data.length
    ? `${line} L${x(data.length - 1).toFixed(1)} ${MARGIN.top + innerH} L${x(0).toFixed(1)} ${MARGIN.top + innerH} Z`
    : "";

  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70))));
  const lastIndex = data.length - 1;
  const shown = active ?? lastIndex;

  function indexFromPointer(e: { clientX: number; currentTarget: Element }) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    if (data.length < 2) return 0;
    return Math.min(lastIndex, Math.max(0, Math.round((px / rect.width) * lastIndex)));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? lastIndex;
    if (e.key === "ArrowLeft") setActive(Math.max(0, current - 1));
    else if (e.key === "ArrowRight") setActive(Math.min(lastIndex, current + 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(lastIndex);
    else if (e.key === "Enter" && data[current]) router.push(`/boletim/${data[current].slug}`);
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  }

  if (points.length === 0) return null;

  const activePoint = data[shown];
  const prevValue = shown > 0 ? data[shown - 1][metricKey] : null;
  const tooltipLeft = activePoint ? Math.min(Math.max(x(shown), 90), Math.max(90, width - 90)) : 0;
  const tooltipTop = activePoint ? Math.max(0, y(activePoint[metricKey]) - 64) : 0;

  return (
    <div className="card p-5 md:p-6">
      {/* Filtros — uma linha acima de tudo o que eles afetam */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Indicador" className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={m.key === metricKey}
              onClick={() => {
                setMetricKey(m.key);
                setActive(null);
              }}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors ring-inset",
                m.key === metricKey ? "bg-navy-900 text-white ring-navy-900" : "bg-card text-ink-2 ring-line-strong hover:bg-canvas",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-full bg-canvas p-1" role="group" aria-label="Período">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={range === r.key}
                onClick={() => {
                  setRange(r.key);
                  setActive(null);
                }}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  range === r.key ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-full bg-canvas p-1" role="group" aria-label="Visualização">
            {(["chart", "table"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  view === v ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink",
                )}
              >
                {v === "chart" ? "Gráfico" : "Tabela"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats ? (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-b border-line pb-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Última edição</dt>
            <dd className="mt-1 font-display text-xl font-bold text-ink">{metric.format(stats.last)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Variação no período</dt>
            <dd className="mt-1.5">
              {stats.change == null ? "—" : <DeltaBadge metric={metricKey} change={stats.change} className="text-sm" />}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Mínima</dt>
            <dd className="mt-1 font-display text-xl font-bold text-ink">{metric.format(stats.min)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Máxima</dt>
            <dd className="mt-1 font-display text-xl font-bold text-ink">{metric.format(stats.max)}</dd>
          </div>
        </dl>
      ) : null}

      {view === "chart" ? (
        <div
          ref={wrapRef}
          className="relative mt-4 outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-brand-blue"
          tabIndex={0}
          role="group"
          aria-label={`Gráfico de ${METRIC_LABEL[metricKey].name} por edição. Use as setas para navegar e Enter para abrir a edição.`}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          {width > 0 ? (
            <svg width={width} height={HEIGHT} className="block overflow-visible select-none">
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke="#e3e8ef" strokeWidth={1} />
                  <text x={MARGIN.left - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[11px] tabular-nums">
                    {metric.tick(t)}
                  </text>
                </g>
              ))}
              {data.map((p, i) =>
                i % labelEvery === 0 || i === lastIndex ? (
                  <text key={p.slug} x={x(i)} y={HEIGHT - 10} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">
                    {formatDayMonth(p.referenceDate)}
                  </text>
                ) : null,
              )}

              <path d={area} fill={metric.color} opacity={0.1} />
              <path d={line} fill="none" stroke={metric.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

              {activePoint ? (
                <line
                  x1={x(shown)}
                  x2={x(shown)}
                  y1={MARGIN.top}
                  y2={MARGIN.top + innerH}
                  stroke="#9aa6b8"
                  strokeWidth={1}
                  opacity={active == null ? 0 : 1}
                />
              ) : null}
              {activePoint ? (
                <circle cx={x(shown)} cy={y(activePoint[metricKey])} r={5} fill={metric.color} stroke="#fff" strokeWidth={2} />
              ) : null}

              {/* Área de captura: o crosshair encontra a edição mais próxima do ponteiro */}
              <rect
                x={MARGIN.left - 12}
                y={MARGIN.top}
                width={innerW + 24}
                height={innerH}
                fill="transparent"
                className="cursor-pointer"
                onPointerMove={(e) => setActive(indexFromPointer(e))}
                onPointerLeave={() => setActive(null)}
                onClick={(e) => {
                  const p = data[indexFromPointer(e)];
                  if (p) router.push(`/boletim/${p.slug}`);
                }}
              />
            </svg>
          ) : (
            <div style={{ height: HEIGHT }} />
          )}

          {activePoint && width > 0 ? (
            <div
              className="pointer-events-none absolute -translate-x-1/2 rounded-xl bg-navy-950 px-3 py-2 text-white shadow-lg"
              style={{ left: tooltipLeft, top: tooltipTop }}
              aria-live="polite"
            >
              <p className="text-sm font-bold whitespace-nowrap tabular-nums">{metric.format(activePoint[metricKey])}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.6875rem] whitespace-nowrap text-white/70">
                {formatDateShort(activePoint.referenceDate)}
                {prevValue != null ? (
                  <DeltaBadge metric={metricKey} change={variation(activePoint[metricKey], prevValue)} tone="dark" />
                ) : null}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="-mx-5 mt-4 overflow-x-auto px-5 md:-mx-6 md:px-6">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Indicadores por edição</caption>
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">Edição</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Cobre (US$/t)</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Dólar (R$)</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Estoques (t)</th>
                <th scope="col" className="py-2 font-semibold">Viés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {[...data].reverse().map((p, i, arr) => {
                const prev = arr[i + 1];
                return (
                  <tr key={p.slug} className="hover:bg-wash">
                    <th scope="row" className="py-2.5 pr-3 font-medium">
                      <a href={`/boletim/${p.slug}`} className="text-navy-700 underline decoration-line-strong underline-offset-4 hover:decoration-navy-700">
                        {formatDateShort(p.referenceDate)}
                      </a>
                    </th>
                    <td className="py-2.5 pr-3 text-right">
                      {formatNumber(p.copper, 2)}
                      {prev ? <span className="ml-2 text-xs text-muted">{formatPercent(variation(p.copper, prev.copper) ?? 0)}</span> : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatNumber(p.dollar, 4)}
                      {prev ? <span className="ml-2 text-xs text-muted">{formatPercent(variation(p.dollar, prev.dollar) ?? 0)}</span> : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatNumber(p.stocks, 0)}
                      {prev ? <span className="ml-2 text-xs text-muted">{formatPercent(variation(p.stocks, prev.stocks) ?? 0)}</span> : null}
                    </td>
                    <td className="py-2.5">{BIAS_SHORT[p.bias]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        {view === "chart"
          ? "Passe o mouse (ou use as setas do teclado) para ver cada edição; clique para abrir o boletim."
          : "Variação em relação à edição anterior ao lado de cada valor."}
      </p>
    </div>
  );
}
