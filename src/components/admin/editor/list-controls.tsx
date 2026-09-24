"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

type ItemToolbarProps = {
  /** Descrição do item para os botões (ex.: "notícia 2"). */
  itemLabel: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  children?: ReactNode;
};

/** Botões de mover para cima/baixo e remover de um item de lista. */
export function ItemToolbar({ itemLabel, index, count, onMove, onRemove, children }: ItemToolbarProps) {
  const iconButton =
    "grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-navy-50 hover:text-ink disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 text-xs font-semibold tracking-[0.1em] text-muted uppercase">{children}</div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          aria-label={`Mover ${itemLabel} para cima`}
          title="Mover para cima"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(index, index + 1)}
          disabled={index === count - 1}
          aria-label={`Mover ${itemLabel} para baixo`}
          title="Mover para baixo"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${iconButton} hover:bg-up-bg hover:text-up-ink`}
          onClick={onRemove}
          aria-label={`Remover ${itemLabel}`}
          title="Remover"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

type AddButtonProps = {
  label: string;
  onClick: () => void;
  count: number;
  max: number;
  /** Texto quando o limite foi atingido (ex.: "Máximo de 8 notícias"). */
  limitLabel: string;
};

export function AddItemButton({ label, onClick, count, max, limitLabel }: AddButtonProps) {
  const full = count >= max;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        disabled={full}
        icon={<Plus className="size-4" aria-hidden="true" />}
        className="border-dashed"
      >
        {label}
      </Button>
      <span className="text-xs text-muted">{full ? limitLabel : `${count} de ${max}`}</span>
    </div>
  );
}

export function EmptyList({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line-strong bg-wash px-4 py-3 text-sm text-muted">{children}</p>;
}
