"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/**
 * Janela modal com o <dialog> nativo: prende o foco, fecha com Esc e com clique fora.
 * O elemento com `data-autofocus` recebe o foco ao abrir.
 */
export function Dialog({ open, onClose, title, description, children, footer, icon, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      el.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={clsx(
        "m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),30rem)] overflow-y-auto rounded-[var(--radius-card)] bg-white p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-navy-950/55 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      {open ? (
        <div className="relative p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Fechar"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-start gap-4 pr-8">
            {icon ? <span className="shrink-0">{icon}</span> : null}
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-lg leading-snug font-bold text-navy-800">
                {title}
              </h2>
              {description ? (
                <div id={descriptionId} className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          {children ? <div className="mt-5">{children}</div> : null}
          {footer ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
