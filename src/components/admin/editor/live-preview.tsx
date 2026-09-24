"use client";

import { clsx } from "clsx";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { BulletinView } from "@/components/bulletin/bulletin-view";
import type { BulletinContent } from "@/lib/bulletin/schema";
import type { HistoryPoint } from "@/lib/bulletin/types";
import type { FormValues } from "./sections";
import { Segmented } from "../ui/segmented";

type Device = "desktop" | "mobile";

/** Largura do conteúdo no site: max-w-6xl (1152px) no computador e um celular de 390px. */
const FRAME: Record<Device, { width: number; padding: number }> = {
  desktop: { width: 1152, padding: 24 },
  mobile: { width: 390, padding: 16 },
};
const PHONE_BEZEL = 10;

/**
 * Pré-visualização ao vivo: o mesmo <BulletinView> da página pública, numa "moldura" com a largura
 * real do site, reduzida com CSS zoom para caber no painel. Como o boletim usa container queries,
 * o layout fica idêntico ao do site.
 */
export function LivePreview({ history, draft, className }: { history: HistoryPoint[]; draft: boolean; className?: string }) {
  const values = useWatch<FormValues>();
  const content = useDeferredValue(values) as unknown as BulletinContent;
  const [choice, setChoice] = useState<Device | null>(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setAreaWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sem escolha explícita: celular quando o painel é estreito, computador nos demais casos.
  const device: Device = choice ?? (areaWidth > 0 && areaWidth < 640 ? "mobile" : "desktop");
  const frame = FRAME[device];
  const outerWidth = frame.width + (device === "mobile" ? PHONE_BEZEL * 2 : 0);
  const zoom = areaWidth > 0 ? Math.min(1, areaWidth / outerWidth) : 1;

  return (
    <section aria-label="Pré-visualização do boletim" className={clsx("flex-col bg-[#e9edf3]", className)}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Eye className="size-4 shrink-0 text-navy-700" aria-hidden="true" />
          <p className="truncate text-sm font-semibold text-ink">
            Pré-visualização
            <span className="font-normal text-muted"> · como vai aparecer no site</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {areaWidth > 0 && zoom < 1 ? (
            <span className="hidden text-xs text-muted tabular-nums sm:inline" title="Reduzido para caber na tela">
              {Math.round(zoom * 100)}%
            </span>
          ) : null}
          <Segmented<Device>
            ariaLabel="Tamanho da tela"
            size="sm"
            value={device}
            onChange={setChoice}
            options={[
              { value: "desktop", label: "Computador", icon: <Monitor className="size-3.5" aria-hidden="true" /> },
              { value: "mobile", label: "Celular", icon: <Smartphone className="size-3.5" aria-hidden="true" /> },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <div ref={areaRef} className="w-full" style={{ visibility: areaWidth > 0 ? "visible" : "hidden" }}>
          <div
            className={clsx(
              "mx-auto",
              device === "mobile" &&
                "overflow-hidden rounded-[2.25rem] border-navy-950 bg-navy-950 shadow-[0_24px_48px_-24px_rgb(11_27_51/0.45)]",
            )}
            style={{
              width: outerWidth,
              zoom,
              borderWidth: device === "mobile" ? PHONE_BEZEL : 0,
            }}
          >
            <div
              className={clsx("bg-canvas", device === "mobile" ? "rounded-[1.6rem]" : "rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]")}
              style={{ width: frame.width, padding: frame.padding }}
            >
              <BulletinView content={content} history={history} draft={draft} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
