import { z } from "zod";

/**
 * Estrutura de um boletim. É o contrato entre o editor do painel, o banco (coluna JSON)
 * e a página pública — tudo que aparece no boletim vem daqui.
 */

/** Pressão que um fator exerce sobre o preço do cobre (e, portanto, do cabo). */
export const pressureSchema = z.enum(["alta", "baixa", "neutro"]);
export type Pressure = z.infer<typeof pressureSchema>;

/** Leitura geral do mercado. */
export const biasSchema = z.enum(["alta", "baixa", "lateral"]);
export type Bias = z.infer<typeof biasSchema>;

/** Ícones disponíveis para notícias e linhas do termômetro. */
export const topicIconSchema = z.enum([
  "cobre",
  "estoque",
  "china",
  "eua",
  "dolar",
  "juros",
  "producao",
  "oferta",
  "economia",
  "geopolitica",
  "energia",
  "clima",
  "outro",
]);
export type TopicIcon = z.infer<typeof topicIconSchema>;

const text = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres`);
const requiredText = (max: number, message = "Campo obrigatório") => text(max).min(1, message);

const positiveNumber = z
  .number({ error: "Informe um número" })
  .finite("Informe um número")
  .positive("Deve ser maior que zero");

export const averageSchema = z.object({
  label: requiredText(40),
  note: text(40).default(""),
  value: positiveNumber,
});
export type Average = z.infer<typeof averageSchema>;

export const quoteSchema = z.object({
  value: positiveNumber,
  /** Valor da edição anterior — usado para calcular a variação semanal. */
  previous: positiveNumber.nullable(),
  averages: z.array(averageSchema).max(3).default([]),
  source: text(120).default(""),
});
export type Quote = z.infer<typeof quoteSchema>;

export const stocksSchema = z.object({
  value: positiveNumber,
  previous: positiveNumber.nullable(),
  /** Data de referência do estoque anterior (AAAA-MM-DD). */
  previousDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default(""),
  source: text(120).default(""),
});
export type Stocks = z.infer<typeof stocksSchema>;

export const newsItemSchema = z.object({
  icon: topicIconSchema,
  title: requiredText(60, "Dê um título à notícia"),
  text: requiredText(320, "Escreva o resumo da notícia"),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const thermometerRowSchema = z.object({
  icon: topicIconSchema,
  indicator: requiredText(40, "Nome do indicador"),
  situation: requiredText(40, "Situação"),
  impact: pressureSchema,
});
export type ThermometerRow = z.infer<typeof thermometerRowSchema>;

export const sourceSchema = z.object({
  name: requiredText(80, "Nome da fonte"),
  url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Use um endereço começando com https://")
    .default(""),
});
export type Source = z.infer<typeof sourceSchema>;

export const bulletinContentSchema = z.object({
  /** Data de referência dos dados (AAAA-MM-DD). Define a URL e a ordem das edições. */
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  title: requiredText(80),
  subtitle: text(80).default(""),
  /** Manchete curta — aparece nos cards da página inicial e no compartilhamento. */
  headline: requiredText(140, "Escreva uma manchete para a edição"),
  intro: text(280).default(""),
  coverImageUrl: text(500)
    .refine((v) => v === "" || /^(https?:\/\/\S+|\/[^/\s]\S*)$/i.test(v), "Use um endereço https:// ou envie uma imagem")
    .default(""),

  copper: quoteSchema,
  dollar: quoteSchema,
  stocks: stocksSchema,

  direction: z.object({
    bias: biasSchema,
    summary: text(220).default(""),
  }),

  news: z.array(newsItemSchema).max(8),
  factorsUp: z.array(requiredText(140, "Descreva o fator")).max(6),
  factorsDown: z.array(requiredText(140, "Descreva o fator")).max(6),

  reading: z.object({
    bias: biasSchema,
    text: text(500).default(""),
  }),

  thermometer: z.array(thermometerRowSchema).max(10),

  priceImpact: text(600).default(""),
  clientMessage: text(600).default(""),

  sources: z.array(sourceSchema).max(8),
  author: z.object({
    name: requiredText(80, "Informe quem elaborou"),
    role: text(80).default(""),
  }),
});

export type BulletinContent = z.infer<typeof bulletinContentSchema>;
/** Forma aceita pelo formulário (antes dos defaults do zod serem aplicados). */
export type BulletinContentInput = z.input<typeof bulletinContentSchema>;

export const bulletinStatusSchema = z.enum(["draft", "published"]);
export type BulletinStatus = z.infer<typeof bulletinStatusSchema>;
