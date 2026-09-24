import { clsx } from "clsx";
import { BIAS_LABEL } from "@/lib/bulletin/labels";
import { formatDollar, formatNumber, formatTonnes } from "@/lib/bulletin/format";
import type { EditionSummary } from "@/lib/bulletin/summary";
import { DeltaBadge } from "./delta-badge";

/**
 * Capa da edição. Sem foto, vira um "mini painel" com os números da semana sobre os fios de cobre —
 * assim cada card já informa algo antes do clique.
 */
export function EditionCover({ edition, size, className }: { edition: EditionSummary; size: "lg" | "md" | "sm"; className?: string }) {
  const hasImage = Boolean(edition.coverImageUrl);
  return (
    <div
      className={clsx(
        "copper-wires relative isolate flex overflow-hidden text-white print-keep-color",
        size === "lg" && "flex-col justify-between p-6 md:p-8",
        size === "md" && "flex-col justify-between p-5",
        size === "sm" && "flex-col justify-center p-3",
        className,
      )}
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- URL livre (Blob ou colada pelo editor) */}
          <img src={edition.coverImageUrl} alt="" className="absolute inset-0 -z-10 size-full object-cover" loading="lazy" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-900/55 to-navy-900/20" />
        </>
      ) : null}

      {size === "sm" ? (
        <>
          <p className="text-[0.625rem] font-semibold tracking-[0.12em] text-copper-300 uppercase">Cobre US$/t</p>
          <p className="mt-0.5 font-display text-lg leading-none font-bold">{formatNumber(edition.copper.value, 0)}</p>
          <DeltaBadge metric="copper" change={edition.copper.change} tone="dark" className="mt-1.5 self-start" />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <p className={clsx("font-semibold tracking-[0.14em] text-copper-300 uppercase", size === "lg" ? "text-xs" : "text-[0.625rem]")}>
              Cobre LME · US$/t
            </p>
            <span className={clsx("rounded-full bg-white/10 font-semibold ring-1 ring-white/20 backdrop-blur-sm", size === "lg" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[0.625rem]")}>
              {BIAS_LABEL[edition.bias]}
            </span>
          </div>
          <div className={size === "lg" ? "mt-10" : "mt-6"}>
            <p className={clsx("font-display leading-none font-bold tracking-tight", size === "lg" ? "text-5xl md:text-6xl" : "text-3xl")}>
              {formatNumber(edition.copper.value, 2)}
            </p>
            <DeltaBadge metric="copper" change={edition.copper.change} tone="dark" className={clsx("mt-3", size === "lg" && "text-sm")} />
          </div>
          {size === "lg" ? (
            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
              <div>
                <dt className="text-[0.6875rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Dólar</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2 font-display text-xl font-bold">
                  {formatDollar(edition.dollar.value)}
                  <DeltaBadge metric="dollar" change={edition.dollar.change} tone="dark" />
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Estoques LME</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2 font-display text-xl font-bold">
                  {formatTonnes(edition.stocks.value)}
                  <DeltaBadge metric="stocks" change={edition.stocks.change} tone="dark" />
                </dd>
              </div>
            </dl>
          ) : null}
        </>
      )}
    </div>
  );
}
