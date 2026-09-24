import { clsx } from "clsx";
import { useId } from "react";

/**
 * Marca da New Cabos redesenhada em SVG (raio + cabo em anel), para ficar nítida em qualquer tamanho.
 * Para usar o arquivo oficial, substitua o <svg> por <Image src="/brand/logo.svg" … />.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`bolt-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffd000" />
          <stop offset="0.55" stopColor="#f5a70f" />
          <stop offset="1" stopColor="#ee7d11" />
        </linearGradient>
        <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#12b0c9" />
          <stop offset="1" stopColor="#1479f6" />
        </linearGradient>
      </defs>
      <ellipse
        cx="32"
        cy="38"
        rx="25"
        ry="12"
        transform="rotate(-18 32 38)"
        fill="none"
        stroke={`url(#ring-${id})`}
        strokeWidth="5"
      />
      <path d="M35 3 L17 35 H29 L23 61 L46 25 H34 L42 3 Z" fill={`url(#bolt-${id})`} />
      <path
        d="M8.2 45.7 A25 12 -18 0 0 55.8 30.3"
        fill="none"
        stroke={`url(#ring-${id})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M54.5 31.5 L60 19" stroke="#7bb328" strokeWidth="5" strokeLinecap="round" />
      <path d="M59.2 20.5 L61.6 15" stroke="#a7b0bd" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-9 shrink-0" />
      <span
        className={clsx(
          "font-display leading-[0.85] font-extrabold tracking-tight",
          tone === "dark" ? "text-navy-800" : "text-white",
        )}
      >
        <span className="block text-[1.05rem]">NEW</span>
        <span className="block text-[0.82rem] tracking-[0.06em]">CABOS</span>
      </span>
    </span>
  );
}
