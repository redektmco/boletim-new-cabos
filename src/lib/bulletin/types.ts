import type { Bias } from "./schema";

/** Um ponto da série histórica (uma edição), usado em gráficos e minigráficos. */
export type HistoryPoint = {
  slug: string;
  referenceDate: string;
  copper: number;
  dollar: number;
  stocks: number;
  bias: Bias;
};
