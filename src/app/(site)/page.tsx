import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BiasPill } from "@/components/bulletin/pressure";
import { EditionCardCompact } from "@/components/site/edition-card";
import { EditionCover } from "@/components/site/edition-cover";
import { EditionsBrowser } from "@/components/site/editions-browser";
import { HistoryChart } from "@/components/site/history-chart";
import { listPublished, toHistory } from "@/lib/bulletins";
import { formatDateCompact, formatDateLong } from "@/lib/bulletin/format";
import { toSummary } from "@/lib/bulletin/summary";

export const revalidate = 300;

export default async function HomePage() {
  const rows = await listPublished();
  const editions = rows.map(toSummary);
  const history = toHistory(rows);
  const [latest, ...older] = editions;

  return (
    <div className="relative overflow-hidden">
      <Squares />

      <section className="relative mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">New Cabos · Informativo semanal</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">Boletim do Cobre</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
              Os números da LME, do dólar e dos estoques em leitura rápida — e o que eles significam para o preço dos seus
              cabos fotovoltaicos.
            </p>
          </div>
          {latest ? (
            <p className="text-sm text-muted md:text-right">
              Última atualização
              <span className="block font-semibold text-ink">{formatDateLong(latest.referenceDate)}</span>
            </p>
          ) : null}
        </div>

        {latest ? (
          <>
            <Link
              href={`/boletim/${latest.slug}`}
              className="card group mt-10 grid overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] md:grid-cols-[1.05fr_1fr]"
            >
              <EditionCover edition={latest} size="lg" className="min-h-80" />
              <div className="flex flex-col p-6 md:p-10">
                <p className="eyebrow">
                  Edição nº {latest.editionNumber} · {formatDateCompact(latest.referenceDate)}
                </p>
                <h2 className="mt-4 font-display text-2xl leading-tight font-bold tracking-tight text-balance text-ink group-hover:text-navy-700 md:text-[2rem]">
                  {latest.headline}
                </h2>
                {latest.directionSummary ? (
                  <p className="mt-4 leading-relaxed text-ink-2">{latest.directionSummary}</p>
                ) : null}
                <div className="mt-5">
                  <BiasPill bias={latest.bias} />
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
                  <p className="text-sm text-muted">
                    {latest.author ? <span className="font-medium text-ink-2">{latest.author}</span> : null}
                    {latest.author ? " · " : ""}
                    {formatDateCompact(latest.referenceDate)}
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-navy-700">
                    Ler o boletim completo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>

            {older.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {older.slice(0, 3).map((edition) => (
                  <EditionCardCompact key={edition.slug} edition={edition} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="card mt-10 p-10 text-center">
            <h2 className="font-display text-2xl font-bold">A primeira edição está a caminho</h2>
            <p className="mt-2 text-ink-2">Volte em breve para acompanhar o mercado do cobre com a New Cabos.</p>
          </div>
        )}
      </section>

      {history.length > 1 ? (
        <section id="historico" className="relative mt-20 scroll-mt-20 border-y border-line bg-white py-16 md:mt-28 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Histórico</p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-balance text-ink md:text-5xl">
                Cobre, dólar e estoques semana a semana
              </h2>
              <p className="mt-4 text-ink-2">
                Acompanhe a tendência dos indicadores que formam o custo do cabo. Cada ponto é uma edição do boletim.
              </p>
            </div>
            <div className="mt-10">
              <HistoryChart points={history} />
            </div>
          </div>
        </section>
      ) : null}

      {older.length ? (
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 md:mt-28">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="eyebrow">Arquivo</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-ink md:text-5xl">
              Edições anteriores
            </h2>
          </div>
          <EditionsBrowser editions={older} limit={6} />
          {older.length > 6 ? (
            <div className="mt-10 text-center">
              <Link
                href="/boletins"
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-navy-900"
              >
                Ver todas as edições
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <section aria-label="Fontes de dados" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold tracking-[0.14em] text-muted uppercase">Dados de referência</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 font-display text-xl font-bold tracking-tight text-[#9aa4b5]">
          <li>London Metal Exchange</li>
          <li>Shockmetais</li>
          <li>Investing.com</li>
        </ul>
      </section>
    </div>
  );
}

/** Quadradinhos decorativos (como na referência de layout), só em telas grandes. */
function Squares() {
  const cells = [
    [0, 0], [1, 0], [3, 0], [1, 1], [2, 1], [0, 2], [2, 2], [3, 3],
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-8 right-[max(1rem,calc(50%-36rem))] hidden grid-cols-4 gap-0 lg:grid">
      {Array.from({ length: 16 }, (_, i) => {
        const on = cells.some(([x, y]) => x === i % 4 && y === Math.floor(i / 4));
        return <span key={i} className={on ? "size-12 bg-navy-100/50" : "size-12"} />;
      })}
    </div>
  );
}
