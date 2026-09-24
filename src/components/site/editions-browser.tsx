"use client";

import { clsx } from "clsx";
import { useState } from "react";
import type { Bias } from "@/lib/bulletin/schema";
import type { EditionSummary } from "@/lib/bulletin/summary";
import { EditionCard } from "./edition-card";

const FILTERS: { key: "todas" | Bias; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "alta", label: "Viés de alta" },
  { key: "lateral", label: "Mercado lateral" },
  { key: "baixa", label: "Viés de baixa" },
];

/** Grade de edições com filtro por viés (e por ano, quando houver mais de um). */
export function EditionsBrowser({ editions, limit }: { editions: EditionSummary[]; limit?: number }) {
  const [bias, setBias] = useState<(typeof FILTERS)[number]["key"]>("todas");
  const years = [...new Set(editions.map((e) => e.referenceDate.slice(0, 4)))];
  const [year, setYear] = useState<string>("todos");

  const filtered = editions.filter(
    (e) => (bias === "todas" || e.bias === bias) && (year === "todos" || e.referenceDate.startsWith(year)),
  );
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar edições">
        {FILTERS.map((f) => {
          const count = editions.filter((e) => f.key === "todas" || e.bias === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={bias === f.key}
              onClick={() => setBias(f.key)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors ring-inset",
                bias === f.key ? "bg-navy-900 text-white ring-navy-900" : "bg-card text-ink-2 ring-line-strong hover:bg-canvas",
              )}
            >
              {f.label}
              <span className={clsx("ml-1.5 text-xs", bias === f.key ? "text-white/60" : "text-muted")}>{count}</span>
            </button>
          );
        })}
        {years.length > 1 ? (
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Ano"
            className="rounded-full bg-card px-4 py-1.5 text-sm font-medium text-ink-2 ring-1 ring-line-strong ring-inset"
          >
            <option value="todos">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {visible.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((edition) => (
            <EditionCard key={edition.slug} edition={edition} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line-strong p-10 text-center text-muted">
          Nenhuma edição com esse filtro.
        </p>
      )}
    </div>
  );
}
