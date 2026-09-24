import { z } from "zod";

/**
 * Mensagens padrão do zod em português, usadas só onde o schema não traz mensagem própria
 * (as mensagens do schema do boletim têm prioridade). Aplicado por chamada, sem mexer na configuração global.
 */
export const zodErrorPtBR = z.locales.ptBR().localeError;

const FIELD_LABEL: Record<string, string> = {
  referenceDate: "Data de referência",
  title: "Título",
  subtitle: "Subtítulo",
  headline: "Manchete",
  intro: "Texto de abertura",
  coverImageUrl: "Imagem de capa",
  copper: "Cobre",
  dollar: "Dólar",
  stocks: "Estoques",
  direction: "Direção do mercado",
  news: "Notícias",
  factorsUp: "Fatores de alta",
  factorsDown: "Fatores de baixa",
  reading: "Nossa leitura",
  thermometer: "Termômetro",
  priceImpact: "Impacto no preço",
  clientMessage: "Mensagem para os clientes",
  sources: "Fontes",
  author: "Autoria",
};

/** "Manchete: Escreva uma manchete para a edição" — resumo legível do primeiro problema. */
export function describeIssues(error: z.ZodError) {
  const first = error.issues[0];
  if (!first) return "Revise os campos destacados.";
  const label = FIELD_LABEL[String(first.path[0] ?? "")];
  const more = error.issues.length > 1 ? ` (e mais ${error.issues.length - 1} campo(s))` : "";
  return `${label ? `${label}: ` : ""}${first.message}${more}`;
}
