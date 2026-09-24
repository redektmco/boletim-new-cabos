import { addDaysISO, monthName, parseISODate, todayISO } from "./format";
import type { BulletinContent, BulletinContentInput } from "./schema";

/** Campo numérico ainda não preenchido no formulário (o zod exige o valor antes de salvar). */
const EMPTY_NUMBER = undefined as unknown as number;

export const DEFAULT_SOURCES: BulletinContent["sources"] = [
  { name: "Shockmetais (LME)", url: "https://www.shockmetais.com.br" },
  { name: "Investing.com (cobre e dólar)", url: "https://br.investing.com" },
  { name: "LME", url: "https://www.lme.com" },
];

export const DEFAULT_THERMOMETER: BulletinContent["thermometer"] = [
  { icon: "cobre", indicator: "LME Cobre", situation: "", impact: "neutro" },
  { icon: "estoque", indicator: "Estoque LME", situation: "", impact: "neutro" },
  { icon: "china", indicator: "Demanda China", situation: "", impact: "neutro" },
  { icon: "dolar", indicator: "Dólar (USD/BRL)", situation: "", impact: "neutro" },
  { icon: "producao", indicator: "Produção de cobre", situation: "", impact: "neutro" },
  { icon: "economia", indicator: "Economia global", situation: "", impact: "neutro" },
];

function averageLabels(referenceDate: string) {
  const { month } = parseISODate(referenceDate);
  const previousMonth = month === 1 ? 12 : month - 1;
  return [
    { label: "Semana anterior", note: "" },
    { label: "Mês atual", note: monthName(month) },
    { label: "Mês anterior", note: monthName(previousMonth) },
  ];
}

/** Boletim em branco — usado quando ainda não existe nenhuma edição. */
export function emptyBulletin(referenceDate = todayISO()): BulletinContentInput {
  return {
    referenceDate,
    title: "Boletim Semanal do Cobre",
    subtitle: "LME & Mercado",
    headline: "",
    intro:
      "Acompanhe os principais fatores que influenciam o preço do cobre e como eles podem impactar os preços nos próximos dias.",
    coverImageUrl: "",
    copper: {
      value: EMPTY_NUMBER,
      previous: null,
      averages: averageLabels(referenceDate).map((a) => ({ ...a, value: EMPTY_NUMBER })),
      source: "Shockmetais (referência LME)",
    },
    dollar: {
      value: EMPTY_NUMBER,
      previous: null,
      averages: averageLabels(referenceDate).map((a) => ({ ...a, value: EMPTY_NUMBER })),
      source: "Investing.com",
    },
    stocks: {
      value: EMPTY_NUMBER,
      previous: null,
      previousDate: "",
      source: "LME (londonmetalexchange.com)",
    },
    direction: { bias: "lateral", summary: "" },
    news: [],
    factorsUp: [],
    factorsDown: [],
    reading: { bias: "lateral", text: "" },
    thermometer: DEFAULT_THERMOMETER,
    priceImpact: "",
    clientMessage: "",
    sources: DEFAULT_SOURCES,
    author: { name: "", role: "New Cabos" },
  };
}

/**
 * Nova edição a partir da última: os valores atuais viram "anteriores", a data avança uma semana
 * e os textos ficam como ponto de partida para edição.
 */
export function nextBulletinFrom(previous: BulletinContent): BulletinContentInput {
  const today = todayISO();
  const oneWeekLater = addDaysISO(previous.referenceDate, 7);
  const referenceDate = oneWeekLater > today ? oneWeekLater : today;
  const labels = averageLabels(referenceDate);

  const carryAverages = (averages: BulletinContent["copper"]["averages"]) =>
    labels.map((label, i) => ({ ...label, value: averages[i]?.value ?? EMPTY_NUMBER }));

  return {
    ...structuredClone(previous),
    referenceDate,
    headline: "",
    coverImageUrl: previous.coverImageUrl,
    copper: {
      ...previous.copper,
      previous: previous.copper.value,
      averages: carryAverages(previous.copper.averages),
    },
    dollar: {
      ...previous.dollar,
      previous: previous.dollar.value,
      averages: carryAverages(previous.dollar.averages),
    },
    stocks: {
      ...previous.stocks,
      previous: previous.stocks.value,
      previousDate: previous.referenceDate,
    },
  };
}
