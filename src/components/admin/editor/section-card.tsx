"use client";

import { clsx } from "clsx";
import { ChevronDown, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionDef } from "./sections";

type SectionCardProps = {
  section: SectionDef;
  number: number;
  open: boolean;
  onToggle: () => void;
  hasError: boolean;
  children: ReactNode;
};

/** Cartão recolhível de uma seção do editor. O conteúdo fica montado (só oculto) para o formulário não perder campos. */
export function SectionCard({ section, number, open, onToggle, hasError, children }: SectionCardProps) {
  const contentId = `secao-${section.id}-conteudo`;
  return (
    <section
      id={`secao-${section.id}`}
      aria-labelledby={`secao-${section.id}-titulo`}
      className={clsx("card scroll-mt-16 transition-shadow", hasError && "border-up-line ring-1 ring-up-line")}
    >
      <h2 id={`secao-${section.id}-titulo`} className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex w-full items-start gap-3 rounded-[var(--radius-card)] p-4 text-left sm:p-5"
        >
          <span
            className={clsx(
              "grid size-8 shrink-0 place-items-center rounded-xl font-display text-sm font-bold",
              hasError ? "bg-up text-white" : "bg-navy-800 text-white",
            )}
            aria-hidden="true"
          >
            {number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base leading-snug font-bold text-navy-800">{section.title}</span>
            <span className="mt-0.5 block text-[0.8125rem] leading-snug font-normal text-muted">{section.hint}</span>
          </span>
          {hasError ? (
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-up-bg px-2 py-0.5 text-xs font-semibold text-up-ink ring-1 ring-up-line ring-inset">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              Revisar
            </span>
          ) : null}
          <ChevronDown
            className={clsx("mt-1.5 size-5 shrink-0 text-muted transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div id={contentId} hidden={!open} className="border-t border-line px-4 pt-4 pb-5 sm:px-5">
        <div className="flex flex-col gap-5">{children}</div>
      </div>
    </section>
  );
}
