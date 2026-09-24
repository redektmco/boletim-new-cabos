import { clsx } from "clsx";
import { movementOf, pressureOf } from "@/lib/bulletin/calc";
import { formatPercent } from "@/lib/bulletin/format";
import { PRESSURE_LABEL, type MetricKey } from "@/lib/bulletin/labels";
import { MovementIcon, PRESSURE_STYLES } from "@/components/bulletin/pressure";

const ON_DARK = {
  alta: "bg-[#d92d20]/25 text-[#ffc9c3]",
  baixa: "bg-[#079455]/30 text-[#a6f0c6]",
  neutro: "bg-white/10 text-white/75",
} as const;

/** Variação semanal com seta; a cor indica o efeito no preço (alta = vermelho, baixa = verde). */
export function DeltaBadge({
  metric,
  change,
  tone = "light",
  className,
}: {
  metric: MetricKey;
  change: number | null;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (change == null) return null;
  const movement = movementOf(change);
  const pressure = pressureOf(metric, movement);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums",
        tone === "light" ? ["ring-1 ring-inset", PRESSURE_STYLES[pressure]] : ON_DARK[pressure],
        className,
      )}
      title={`${PRESSURE_LABEL[pressure]} sobre o preço`}
    >
      <MovementIcon movement={movement} className="size-3" />
      {formatPercent(change)}
    </span>
  );
}
