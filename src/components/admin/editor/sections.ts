import type { FieldErrors } from "react-hook-form";
import type { BulletinContentInput } from "@/lib/bulletin/schema";

export type FormValues = BulletinContentInput;

export type SectionId =
  | "identificacao"
  | "cobre"
  | "dolar"
  | "estoques"
  | "direcao"
  | "noticias"
  | "expectativa"
  | "leitura"
  | "termometro"
  | "mensagens"
  | "fontes";

export type SectionDef = {
  id: SectionId;
  title: string;
  /** Rótulo curto para o índice de seções. */
  short: string;
  hint: string;
  fields: (keyof FormValues)[];
};

/** Seções do editor, na mesma ordem em que aparecem no boletim. */
export const SECTIONS: SectionDef[] = [
  {
    id: "identificacao",
    title: "Identificação",
    short: "Identificação",
    hint: "Data dos dados, manchete e textos do topo do boletim.",
    fields: ["referenceDate", "title", "subtitle", "headline", "intro", "coverImageUrl"],
  },
  {
    id: "cobre",
    title: "Cobre (LME)",
    short: "Cobre",
    hint: "Cotação do cobre na Bolsa de Metais de Londres, em US$ por tonelada.",
    fields: ["copper"],
  },
  {
    id: "dolar",
    title: "Dólar",
    short: "Dólar",
    hint: "Cotação do dólar comercial, em reais (até 4 casas decimais).",
    fields: ["dollar"],
  },
  {
    id: "estoques",
    title: "Estoques LME",
    short: "Estoques",
    hint: "Quantidade de cobre nos armazéns da LME, em toneladas.",
    fields: ["stocks"],
  },
  {
    id: "direcao",
    title: "Direção do mercado",
    short: "Direção",
    hint: "A leitura geral da semana: para onde o preço está indo.",
    fields: ["direction"],
  },
  {
    id: "noticias",
    title: "O que movimentou o mercado",
    short: "Notícias",
    hint: "As principais notícias da semana. De 3 a 5 costuma funcionar bem.",
    fields: ["news"],
  },
  {
    id: "expectativa",
    title: "Expectativa para a semana",
    short: "Expectativa",
    hint: "O que pode fazer o preço subir ou cair nos próximos dias.",
    fields: ["factorsUp", "factorsDown"],
  },
  {
    id: "leitura",
    title: "Nossa leitura",
    short: "Leitura",
    hint: "A opinião da New Cabos sobre o cenário, em poucas linhas.",
    fields: ["reading"],
  },
  {
    id: "termometro",
    title: "Termômetro do mercado",
    short: "Termômetro",
    hint: "Como cada fator está pressionando o preço do cobre.",
    fields: ["thermometer"],
  },
  {
    id: "mensagens",
    title: "Impacto no preço e mensagem aos clientes",
    short: "Mensagens",
    hint: "O que o cenário significa para o custo do cabo e para quem compra.",
    fields: ["priceImpact", "clientMessage"],
  },
  {
    id: "fontes",
    title: "Fontes e autoria",
    short: "Fontes",
    hint: "De onde vieram os dados e quem elaborou a edição.",
    fields: ["sources", "author"],
  },
];

export const ALL_SECTION_IDS = SECTIONS.map((s) => s.id);

/** Seções que têm pelo menos um campo com erro, na ordem do formulário. */
export function sectionsWithErrors(errors: FieldErrors<FormValues>): SectionId[] {
  return SECTIONS.filter((section) => section.fields.some((field) => errors[field] != null)).map((s) => s.id);
}

/** id estável para um caminho do formulário (ex.: "copper.value" → "campo-copper-value"). */
export function fieldId(name: string) {
  return `campo-${name.replace(/\./g, "-")}`;
}
