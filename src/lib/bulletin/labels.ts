import type { Bias, Pressure, TopicIcon } from "./schema";

export const BIAS_LABEL: Record<Bias, string> = {
  alta: "Viés de alta",
  baixa: "Viés de baixa",
  lateral: "Mercado lateral",
};

export const BIAS_SHORT: Record<Bias, string> = {
  alta: "Alta",
  baixa: "Baixa",
  lateral: "Lateral",
};

export const PRESSURE_LABEL: Record<Pressure, string> = {
  alta: "Pressão de alta",
  baixa: "Pressão de baixa",
  neutro: "Neutro",
};

export const TOPIC_LABEL: Record<TopicIcon, string> = {
  cobre: "Cobre / LME",
  estoque: "Estoques",
  china: "China",
  eua: "EUA",
  dolar: "Dólar / câmbio",
  juros: "Juros / política monetária",
  producao: "Produção / minas",
  oferta: "Oferta global",
  economia: "Economia global",
  geopolitica: "Geopolítica / tarifas",
  energia: "Energia / transição",
  clima: "Clima / eventos",
  outro: "Outro",
};

/**
 * Para cada indicador do resumo, em que direção o preço do cabo tende a ir quando o valor sobe.
 * Cobre e dólar em alta encarecem a matéria-prima; estoques em alta aliviam.
 */
export const METRIC_UP_PRESSURE = {
  copper: "alta",
  dollar: "alta",
  stocks: "baixa",
} as const satisfies Record<string, Pressure>;

export type MetricKey = keyof typeof METRIC_UP_PRESSURE;

export const METRIC_LABEL: Record<MetricKey, { name: string; unit: string }> = {
  copper: { name: "Cobre (LME)", unit: "US$/tonelada" },
  dollar: { name: "Dólar", unit: "USD/BRL" },
  stocks: { name: "Estoques LME", unit: "toneladas" },
};
