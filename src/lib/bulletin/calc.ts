import { METRIC_UP_PRESSURE, type MetricKey } from "./labels";
import type { Pressure } from "./schema";

/** Variação percentual (0,97 = +0,97%). Null quando não há valor anterior. */
export function variation(value: number | null | undefined, previous: number | null | undefined) {
  if (value == null || previous == null || !Number.isFinite(value) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((value - previous) / previous) * 100;
}

export type Movement = "up" | "down" | "flat";

export function movementOf(change: number | null, epsilon = 0.005): Movement {
  if (change == null || Math.abs(change) < epsilon) return "flat";
  return change > 0 ? "up" : "down";
}

/** Converte o movimento de um indicador na pressão que ele exerce sobre o preço. */
export function pressureOf(metric: MetricKey, movement: Movement): Pressure {
  if (movement === "flat") return "neutro";
  const upPressure = METRIC_UP_PRESSURE[metric];
  if (movement === "up") return upPressure;
  return upPressure === "alta" ? "baixa" : "alta";
}
