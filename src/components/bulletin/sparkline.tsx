import { clsx } from "clsx";

export type SparkPoint = { label: string; value: number; display: string };

/**
 * Minigráfico de tendência: linha recessiva com a edição atual destacada.
 * Cada ponto tem uma área de passagem do mouse (≥ 24px) com o valor no tooltip nativo.
 */
export function Sparkline({ points, className, label }: { points: SparkPoint[]; className?: string; label: string }) {
  if (points.length < 2) {
    return (
      <div className={clsx("flex h-10 items-center text-xs text-muted", className)}>
        Histórico disponível a partir da próxima edição
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4; // respiro vertical (em unidades do viewBox) para o ponto final não cortar
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * 100,
    y: pad + (1 - (p.value - min) / span) * (40 - pad * 2),
  }));
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <figure className={clsx("relative h-10", className)} aria-label={label}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <path
          d={d}
          fill="none"
          stroke="#aab5c5"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-800 ring-2 ring-white print-keep-color"
        style={{ left: `${last.x}%`, top: `${(last.y / 40) * 100}%` }}
      />
      {points.map((p, i) => {
        const width = 100 / (points.length - 1);
        return (
          <span
            key={p.label + i}
            className="absolute inset-y-0 min-w-6 cursor-default"
            style={{ left: `${coords[i].x - width / 2}%`, width: `${width}%` }}
            title={`${p.label}: ${p.display}`}
          />
        );
      })}
      <figcaption className="sr-only">
        {points.map((p) => `${p.label}: ${p.display}`).join("; ")}
      </figcaption>
    </figure>
  );
}
