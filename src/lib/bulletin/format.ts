/** Formatação pt-BR usada no site, no editor e na imagem de compartilhamento. */

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCopper(value: number) {
  return `US$ ${formatNumber(value, 2)}`;
}

export function formatDollar(value: number) {
  return `R$ ${formatNumber(value, 4)}`;
}

export function formatTonnes(value: number) {
  return `${formatNumber(value, 0)} t`;
}

/** Variação em pontos percentuais já multiplicada por 100 (ex.: 0,97). */
export function formatPercent(value: number, { signed = true, decimals = 2 } = {}) {
  const sign = signed && value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value), decimals)}%`;
}

/** Converte AAAA-MM-DD sem cair em problemas de fuso horário. */
export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
}

/** 18/09/2026 */
export function formatDateShort(iso: string) {
  if (!iso) return "";
  const { year, month, day } = parseISODate(iso);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** 18 de setembro de 2026 */
export function formatDateLong(iso: string) {
  if (!iso) return "";
  const { year, month, day } = parseISODate(iso);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

/** 18 set 2026 */
export function formatDateCompact(iso: string) {
  if (!iso) return "";
  const { year, month, day } = parseISODate(iso);
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

/** 18/09 */
export function formatDayMonth(iso: string) {
  if (!iso) return "";
  const { month, day } = parseISODate(iso);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

export function monthName(month: number) {
  return MONTHS[month - 1];
}

/** Data de hoje (fuso de São Paulo) em AAAA-MM-DD. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysISO(iso: string, days: number) {
  const { year, month, day } = parseISODate(iso);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Aceita "14.529,00", "14529,00", "14529.00" e "14,529.00". Retorna null se não for número. */
export function parseDecimal(raw: string): number | null {
  let s = raw.trim().replace(/\s|R\$|US\$|%|t$/gi, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // o último separador é o decimal
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > -1 && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    // "255.100" é milhar, não decimal
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
