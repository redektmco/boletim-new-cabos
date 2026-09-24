import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDateCompact } from "@/lib/bulletin/format";
import type { EditionSummary } from "@/lib/bulletin/summary";
import { EditionCover } from "./edition-cover";

/** Card vertical da grade de edições. */
export function EditionCard({ edition }: { edition: EditionSummary }) {
  return (
    <Link
      href={`/boletim/${edition.slug}`}
      className="card group flex flex-col overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <EditionCover edition={edition} size="md" className="aspect-[16/10] rounded-t-[calc(var(--radius-card)-1px)]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">
          Edição nº {edition.editionNumber} · {formatDateCompact(edition.referenceDate)}
        </p>
        <h3 className="mt-2 line-clamp-3 font-display text-[1.0625rem] leading-snug font-bold text-ink group-hover:text-navy-700">
          {edition.headline}
        </h3>
        <p className="mt-auto flex items-center justify-between pt-4 text-sm text-muted">
          <span>{edition.author || "New Cabos"}</span>
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </p>
      </div>
    </Link>
  );
}

/** Card horizontal compacto (abaixo do destaque da página inicial). */
export function EditionCardCompact({ edition }: { edition: EditionSummary }) {
  return (
    <Link
      href={`/boletim/${edition.slug}`}
      className="card group flex min-w-0 overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
    >
      <EditionCover edition={edition} size="sm" className="w-28 shrink-0 sm:w-32" />
      <div className="min-w-0 p-4">
        <p className="eyebrow">{formatDateCompact(edition.referenceDate)}</p>
        <h3 className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-ink group-hover:text-navy-700">
          {edition.headline}
        </h3>
        <p className="mt-2 text-xs text-muted">
          Edição nº {edition.editionNumber}
          {edition.author ? ` · ${edition.author}` : ""}
        </p>
      </div>
    </Link>
  );
}
