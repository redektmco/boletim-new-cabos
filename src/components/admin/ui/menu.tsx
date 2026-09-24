"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  href?: string;
  external?: boolean;
  tone?: "danger";
  disabled?: boolean;
};

type MenuProps = {
  /** Nome acessível do botão (ex.: "Mais ações para a edição de 18/09/2026"). */
  label: string;
  items: (MenuItem | false | null | undefined)[];
  children: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
};

/** Menu suspenso acessível: setas navegam, Esc fecha e devolve o foco ao botão. */
export function Menu({ label, items, children, triggerClassName, align = "end" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const visible = items.filter(Boolean) as MenuItem[];

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const elements = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    );
    const index = elements.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      elements[(index + 1) % elements.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      elements[(index - 1 + elements.length) % elements.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      elements[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      elements[elements.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const itemClass = (item: MenuItem) =>
    clsx(
      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none",
      item.disabled
        ? "cursor-not-allowed text-muted/60"
        : item.tone === "danger"
          ? "text-up-ink hover:bg-up-bg focus-visible:bg-up-bg"
          : "text-ink hover:bg-navy-50 focus-visible:bg-navy-50",
    );

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {children}
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={clsx(
            "absolute top-full z-40 mt-1.5 w-max min-w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {visible.map((item) => {
            const content = (
              <>
                {item.icon ? <span className="grid size-4 shrink-0 place-items-center [&>svg]:size-4">{item.icon}</span> : null}
                {item.label}
              </>
            );
            if (item.href && !item.disabled) {
              return item.external ? (
                <a
                  key={item.label}
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemClass(item)}
                  onClick={() => close(false)}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.label} role="menuitem" tabIndex={-1} href={item.href} className={itemClass(item)} onClick={() => close(false)}>
                  {content}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.disabled || undefined}
                className={itemClass(item)}
                onClick={() => {
                  if (item.disabled) return;
                  close();
                  item.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
