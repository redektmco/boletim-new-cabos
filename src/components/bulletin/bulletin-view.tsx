import { clsx } from "clsx";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  CircleDollarSign,
  Coins,
  DollarSign,
  ExternalLink,
  Gauge,
  Handshake,
  Lightbulb,
  Newspaper,
  Thermometer,
  TrendingUp,
  UserRound,
  Warehouse,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  formatCopper,
  formatDateLong,
  formatDateShort,
  formatDayMonth,
  formatDollar,
  formatNumber,
  formatTonnes,
} from "@/lib/bulletin/format";
import { METRIC_LABEL, PRESSURE_LABEL, type MetricKey } from "@/lib/bulletin/labels";
import type { BulletinContent, Pressure } from "@/lib/bulletin/schema";
import type { HistoryPoint } from "@/lib/bulletin/types";
import { BiasPill, PressureTag } from "./pressure";
import type { SparkPoint } from "./sparkline";
import { AveragesTable, StatTile } from "./stat-tile";
import { TopicIcon } from "./topic-icon";

export type BulletinViewProps = {
  content: BulletinContent;
  /** Série histórica em ordem cronológica (edições publicadas). */
  history?: HistoryPoint[];
  editionNumber?: number;
  /** Botões de compartilhar etc., exibidos no cabeçalho. */
  actions?: ReactNode;
  /** Mostra a faixa de "rascunho" (preview do editor). */
  draft?: boolean;
  /** Chamada para ação ao lado da mensagem aos clientes (ex.: WhatsApp do comercial). */
  clientCta?: ReactNode;
};

const TREND_POINTS = 10;

const METRIC_FORMAT: Record<MetricKey, (v: number) => string> = {
  copper: formatCopper,
  dollar: formatDollar,
  stocks: formatTonnes,
};

function trendFor(metric: MetricKey, content: BulletinContent, history: HistoryPoint[]): SparkPoint[] {
  const current = content[metric].value;
  const points = history
    .filter((h) => h.referenceDate < content.referenceDate)
    .map((h) => ({ date: h.referenceDate, value: h[metric] }));
  if (Number.isFinite(current)) points.push({ date: content.referenceDate, value: current });
  return points.slice(-TREND_POINTS).map((p) => ({
    label: formatDayMonth(p.date),
    value: p.value,
    display: METRIC_FORMAT[metric](p.value),
  }));
}

export function BulletinView({ content, history = [], editionNumber, actions, draft, clientCta }: BulletinViewProps) {
  const dateShort = formatDateShort(content.referenceDate);
  const counts = content.thermometer.reduce(
    (acc, row) => ({ ...acc, [row.impact]: acc[row.impact] + 1 }),
    { alta: 0, baixa: 0, neutro: 0 } as Record<Pressure, number>,
  );

  return (
    <article className="@container flex flex-col gap-5 @3xl:gap-6">
      {/* Cabeçalho */}
      <header
        className="copper-wires relative overflow-hidden rounded-[var(--radius-card)] bg-cover bg-center px-6 py-8 text-white @3xl:px-10 @3xl:py-11"
        style={
          content.coverImageUrl
            ? {
                backgroundImage: `linear-gradient(100deg, rgb(1 26 61 / 0.97) 0%, rgb(1 26 61 / 0.88) 45%, rgb(1 26 61 / 0.45) 100%), url(${JSON.stringify(content.coverImageUrl)})`,
              }
            : undefined
        }
      >
        {draft ? (
          <span className="absolute top-4 right-4 rounded-full bg-brand-amber px-3 py-1 text-xs font-bold tracking-wide text-navy-900 uppercase">
            Rascunho
          </span>
        ) : null}
        <div className="grid gap-8 @4xl:grid-cols-[1fr_auto] @4xl:items-end">
          <div className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.16em] text-copper-300 uppercase">
              <span>{content.title || "Boletim Semanal do Cobre"}</span>
              {content.subtitle ? (
                <>
                  <span aria-hidden="true" className="text-white/40">
                    •
                  </span>
                  <span>{content.subtitle}</span>
                </>
              ) : null}
              {editionNumber ? (
                <>
                  <span aria-hidden="true" className="text-white/40">
                    •
                  </span>
                  <span className="text-white/70">Edição nº {editionNumber}</span>
                </>
              ) : null}
            </p>
            <h1 className="mt-4 font-display text-[1.75rem] leading-[1.12] font-bold tracking-tight text-balance @3xl:text-[2.5rem]">
              {content.headline || "Manchete da edição"}
            </h1>
            {content.intro ? <p className="mt-4 max-w-2xl text-[0.95rem] text-white/75 @3xl:text-base">{content.intro}</p> : null}
            {actions ? <div className="no-print mt-6">{actions}</div> : null}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm @4xl:min-w-64">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-8 shrink-0 text-brand-amber" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase">Dados de</p>
                <p className="font-display text-lg leading-tight font-bold">{formatDateLong(content.referenceDate)}</p>
              </div>
            </div>
            {content.author.name ? (
              <div className="flex items-center gap-3 border-t border-white/15 pt-3">
                <UserRound className="size-8 shrink-0 text-white/60" aria-hidden="true" strokeWidth={1.5} />
                <div>
                  <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase">Elaborado por</p>
                  <p className="leading-tight font-semibold">
                    {content.author.name}
                    {content.author.role ? <span className="font-normal text-white/60"> · {content.author.role}</span> : null}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Resumo da semana */}
      <section aria-labelledby="resumo">
        <SectionHeading id="resumo" icon={<TrendingUp className="size-5" />} title="Resumo da semana" subtitle="Principais indicadores e variações" />
        <div className="mt-4 grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
          <StatTile
            metric="copper"
            icon={<Coins className="size-5" strokeWidth={1.75} />}
            name={METRIC_LABEL.copper.name}
            unit={METRIC_LABEL.copper.unit}
            value={content.copper.value}
            previous={content.copper.previous}
            format={formatCopper}
            dateLabel={`Cotação de ${dateShort}`}
            comparisonLabel="vs. semana anterior"
            trend={trendFor("copper", content, history)}
            footer={<AveragesTable averages={content.copper.averages} format={(v) => formatNumber(v, 2)} caption="Médias de referência (US$/t)" />}
            source={content.copper.source}
          />
          <StatTile
            metric="dollar"
            icon={<DollarSign className="size-5" strokeWidth={1.75} />}
            name={METRIC_LABEL.dollar.name}
            unit={METRIC_LABEL.dollar.unit}
            value={content.dollar.value}
            previous={content.dollar.previous}
            format={formatDollar}
            dateLabel={`Cotação de ${dateShort}`}
            comparisonLabel="vs. semana anterior"
            trend={trendFor("dollar", content, history)}
            footer={<AveragesTable averages={content.dollar.averages} format={(v) => formatNumber(v, 4)} caption="Médias de referência (R$/US$)" />}
            source={content.dollar.source}
          />
          <StatTile
            metric="stocks"
            icon={<Warehouse className="size-5" strokeWidth={1.75} />}
            name={METRIC_LABEL.stocks.name}
            unit={METRIC_LABEL.stocks.unit}
            value={content.stocks.value}
            previous={content.stocks.previous}
            format={formatTonnes}
            dateLabel={`Posição de ${dateShort}`}
            comparisonLabel={
              content.stocks.previousDate ? `vs. ${formatDayMonth(content.stocks.previousDate)}` : "vs. semana anterior"
            }
            trend={trendFor("stocks", content, history)}
            footer={
              content.stocks.previous ? (
                <div className="rounded-xl bg-wash px-3 py-2.5 print-keep-color">
                  <p className="text-[0.6875rem] font-semibold text-ink-2">
                    Estoque anterior{content.stocks.previousDate ? ` (${formatDayMonth(content.stocks.previousDate)})` : ""}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">{formatTonnes(content.stocks.previous)}</p>
                </div>
              ) : null
            }
            source={content.stocks.source}
          />
          <DirectionTile content={content} counts={counts} />
        </div>
      </section>

      {/* Notícias + expectativa */}
      <div className="grid gap-5 @3xl:gap-6 @4xl:grid-cols-12">
        <section className="card min-w-0 p-5 @3xl:p-6 @4xl:col-span-7" aria-labelledby="movimentou">
          <SectionHeading
            id="movimentou"
            icon={<Newspaper className="size-5" />}
            title="O que movimentou o mercado"
            subtitle="Principais notícias da semana"
          />
          {content.news.length === 0 ? (
            <EmptyNote>Nenhuma notícia adicionada.</EmptyNote>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {content.news.map((item, i) => (
                <li key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-800 text-white print-keep-color">
                    <TopicIcon name={item.icon} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold tracking-wide text-navy-800 uppercase">{item.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card min-w-0 p-5 @3xl:p-6 @4xl:col-span-5" aria-labelledby="expectativa">
          <SectionHeading
            id="expectativa"
            icon={<Gauge className="size-5" />}
            title="Expectativa para a semana"
            subtitle="O que pode puxar o preço para cima ou para baixo"
          />
          <div className="mt-5 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-1">
            <FactorList tone="alta" items={content.factorsUp} />
            <FactorList tone="baixa" items={content.factorsDown} />
          </div>
        </section>
      </div>

      {/* Termômetro + leitura e impacto */}
      <div className="grid gap-5 @3xl:gap-6 @4xl:grid-cols-12">
        <section className="card min-w-0 p-5 @3xl:p-6 @4xl:col-span-7" aria-labelledby="termometro">
          <SectionHeading
            id="termometro"
            icon={<Thermometer className="size-5" />}
            title="Termômetro do mercado"
            subtitle="Como cada fator está influenciando o preço do cobre"
          />
          {content.thermometer.length === 0 ? (
            <EmptyNote>Nenhum indicador adicionado.</EmptyNote>
          ) : (
            <div className="mt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Indicador
                    </th>
                    <th scope="col" className="hidden py-2 pr-3 font-semibold @lg:table-cell">
                      Situação
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Impacto no preço
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {content.thermometer.map((row, i) => (
                    <tr key={i}>
                      <th scope="row" className="py-3 pr-3 font-medium text-ink">
                        <span className="flex items-center gap-2.5">
                          <TopicIcon name={row.icon} className="size-[1.125rem] shrink-0 text-navy-700" />
                          <span>
                            {row.indicator}
                            <span className="block text-xs font-normal text-muted @lg:hidden">{row.situation}</span>
                          </span>
                        </span>
                      </th>
                      <td className="hidden py-3 pr-3 text-ink-2 @lg:table-cell">{row.situation || "—"}</td>
                      <td className="py-3">
                        <PressureTag pressure={row.impact} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-5 @3xl:gap-6 @4xl:col-span-5">
          <section className="card border-navy-100 bg-navy-50 p-5 @3xl:p-6 print-keep-color" aria-labelledby="leitura">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-navy-800 text-brand-amber print-keep-color">
                <Lightbulb className="size-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="leitura" className="section-title">
                  Nossa leitura
                </h2>
                <BiasPill bias={content.reading.bias} className="mt-2" />
                {content.reading.text ? (
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{content.reading.text}</p>
                ) : null}
              </div>
            </div>
          </section>
          <section className="card border-copper-100 bg-copper-50 p-5 @3xl:p-6 print-keep-color" aria-labelledby="impacto">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-copper-500 text-white print-keep-color">
                <CircleDollarSign className="size-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="impacto" className="section-title">
                  Impacto no preço
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
                  {content.priceImpact || "Descreva como o cenário afeta o custo da matéria-prima."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mensagem para o cliente */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-card)] bg-navy-800 p-6 text-white shadow-[var(--shadow-card)] @3xl:p-8 print-keep-color"
        aria-labelledby="clientes"
      >
        <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-10">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-amber">
              <Handshake className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 max-w-3xl">
              <h2 id="clientes" className="font-display text-xl font-bold tracking-tight @3xl:text-2xl">
                O que isso significa para você
              </h2>
              <p className="mt-2 leading-relaxed text-white/80">
                {content.clientMessage || "Escreva a orientação da New Cabos para os clientes."}
              </p>
            </div>
          </div>
          {clientCta ? <div className="no-print shrink-0">{clientCta}</div> : null}
        </div>
      </section>

      {/* Fontes */}
      <footer className="card flex flex-col gap-4 p-5 text-sm @3xl:flex-row @3xl:items-start @3xl:justify-between @3xl:p-6">
        <div>
          <h2 className="eyebrow">Fontes</h2>
          {content.sources.length ? (
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              {content.sources.map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-navy-700 hover:decoration-navy-700"
                    >
                      {s.name}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-ink-2">{s.name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted">—</p>
          )}
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted @3xl:text-right">
          Conteúdo informativo elaborado pela New Cabos com base nas fontes citadas. Não constitui recomendação de
          investimento; preços e condições comerciais são confirmados no momento do pedido.
        </p>
      </footer>
    </article>
  );
}

function SectionHeading({ id, icon, title, subtitle }: { id: string; icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-800 text-white print-keep-color">{icon}</span>
      <div>
        <h2 id={id} className="section-title leading-tight">
          {title}
        </h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="mt-5 rounded-xl border border-dashed border-line-strong p-4 text-sm text-muted">{children}</p>;
}

function FactorList({ tone, items }: { tone: "alta" | "baixa"; items: string[] }) {
  const up = tone === "alta";
  return (
    <div
      className={clsx(
        "rounded-2xl p-4 ring-1 ring-inset print-keep-color",
        up ? "bg-up-bg/60 ring-up-line/70" : "bg-down-bg/60 ring-down-line/70",
      )}
    >
      <h3 className={clsx("flex items-center gap-2 font-display text-sm font-bold uppercase", up ? "text-up-ink" : "text-down-ink")}>
        <span className={clsx("grid size-6 place-items-center rounded-full text-white", up ? "bg-up" : "bg-down")}>
          {up ? <ArrowUp className="size-3.5" strokeWidth={2.5} /> : <ArrowDown className="size-3.5" strokeWidth={2.5} />}
        </span>
        Fatores de {tone}
      </h3>
      {items.length ? (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug text-ink-2">
              <Check className={clsx("mt-0.5 size-4 shrink-0", up ? "text-up" : "text-down")} strokeWidth={2.5} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nenhum fator listado.</p>
      )}
    </div>
  );
}

function DirectionTile({ content, counts }: { content: BulletinContent; counts: Record<Pressure, number> }) {
  const total = counts.alta + counts.baixa + counts.neutro;
  const segments: { key: Pressure; className: string }[] = [
    { key: "alta", className: "bg-up" },
    { key: "neutro", className: "bg-flat" },
    { key: "baixa", className: "bg-down" },
  ];
  return (
    <section className="card flex flex-col p-5" aria-label="Direção do mercado">
      <header className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-800 print-keep-color">
          <TrendingUp className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-[0.95rem] leading-tight font-bold text-navy-800">Direção do mercado</h3>
          <p className="text-xs text-muted">Leitura da New Cabos</p>
        </div>
      </header>
      <div className="mt-4">
        <BiasPill bias={content.direction.bias} size="lg" />
      </div>
      {content.direction.summary ? (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{content.direction.summary}</p>
      ) : null}

      {total > 0 ? (
        <div className="mt-auto pt-5">
          <p className="text-[0.6875rem] font-semibold text-ink-2">Balanço do termômetro</p>
          <div
            className="mt-2 flex h-2.5 gap-[2px] overflow-hidden rounded-full print-keep-color"
            role="img"
            aria-label={`${counts.alta} fatores de alta, ${counts.neutro} neutros, ${counts.baixa} de baixa`}
          >
            {segments
              .filter((s) => counts[s.key] > 0)
              .map((s) => (
                <span
                  key={s.key}
                  className={s.className}
                  style={{ flexGrow: counts[s.key] }}
                  title={`${PRESSURE_LABEL[s.key]}: ${counts[s.key]}`}
                />
              ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
            {segments.map((s) => (
              <li key={s.key} className="inline-flex items-center gap-1.5">
                <span className={clsx("size-2 rounded-full print-keep-color", s.className)} aria-hidden="true" />
                {counts[s.key]} {s.key === "neutro" ? (counts[s.key] === 1 ? "neutro" : "neutros") : `de ${s.key}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
