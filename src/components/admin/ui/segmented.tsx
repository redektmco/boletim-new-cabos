"use client";

import { clsx } from "clsx";
import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  tone?: "up" | "down" | "flat" | "navy";
};

type SegmentedProps<T extends string> = {
  value: T | undefined;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** id do elemento que rotula o grupo. */
  labelledBy?: string;
  ariaLabel?: string;
  id?: string;
  size?: "sm" | "md";
  className?: string;
  invalid?: boolean;
};

const TONE_ACTIVE: Record<NonNullable<SegmentedOption<string>["tone"]>, string> = {
  up: "bg-up-bg text-up-ink ring-up-line",
  down: "bg-down-bg text-down-ink ring-down-line",
  flat: "bg-flat-bg text-flat-ink ring-flat-line",
  navy: "bg-navy-800 text-white ring-navy-800",
};

/** Grupo de opções exclusivas (radiogroup) com navegação por setas. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  labelledBy,
  ariaLabel,
  id,
  size = "md",
  className,
  invalid,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={clsx(
        "inline-flex max-w-full gap-1 rounded-2xl border border-line-strong bg-wash p-1",
        invalid && "border-up",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const focusable = active || (selectedIndex === -1 && index === 0);
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={clsx(
              "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active
                ? clsx("shadow-xs ring-1 ring-inset", TONE_ACTIVE[option.tone ?? "navy"])
                : "text-ink-2 hover:bg-white hover:text-ink",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
