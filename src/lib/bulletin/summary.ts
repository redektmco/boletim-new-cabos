import type { BulletinRow } from "@/lib/db/schema";
import { variation } from "./calc";
import type { Bias } from "./schema";

/** Resumo enxuto de uma edição para cards e listagens (evita mandar o conteúdo inteiro ao navegador). */
export type EditionSummary = {
  slug: string;
  referenceDate: string;
  headline: string;
  editionNumber: number;
  bias: Bias;
  directionSummary: string;
  coverImageUrl: string;
  author: string;
  copper: { value: number; change: number | null };
  dollar: { value: number; change: number | null };
  stocks: { value: number; change: number | null };
};

export function toSummary(row: BulletinRow & { editionNumber: number }): EditionSummary {
  const { content } = row;
  return {
    slug: row.slug,
    referenceDate: row.referenceDate,
    headline: row.headline,
    editionNumber: row.editionNumber,
    bias: content.direction.bias,
    directionSummary: content.direction.summary,
    coverImageUrl: content.coverImageUrl,
    author: content.author.name,
    copper: { value: content.copper.value, change: variation(content.copper.value, content.copper.previous) },
    dollar: { value: content.dollar.value, change: variation(content.dollar.value, content.dollar.previous) },
    stocks: { value: content.stocks.value, change: variation(content.stocks.value, content.stocks.previous) },
  };
}
