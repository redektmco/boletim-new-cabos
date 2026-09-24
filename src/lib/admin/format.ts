/** Datas e horas do painel, sempre no fuso de São Paulo (evita diferença entre servidor e navegador). */

const TZ = "America/Sao_Paulo";

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const timeOnly = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

const dayMonth = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });

function toDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

/** 18/09/2026, 14:32 */
export function formatDateTime(value: Date | string | number | null | undefined) {
  if (value == null) return "—";
  return dateTime.format(toDate(value)).replace(",", " às");
}

/** "Salvo às 14:32" (hoje) ou "Salvo em 18/09 às 14:32". */
export function savedLabel(value: Date | string | number, now: Date = new Date()) {
  const date = toDate(value);
  if (dayKey.format(date) === dayKey.format(now)) return `Salvo às ${timeOnly.format(date)}`;
  return `Salvo em ${dayMonth.format(date)} às ${timeOnly.format(date)}`;
}
