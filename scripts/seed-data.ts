import type { BulletinContent } from "../src/lib/bulletin/schema";
import { DEFAULT_SOURCES } from "../src/lib/bulletin/defaults";

/** Edição de 18/09/2026, transcrita do boletim em imagem que a New Cabos já publicava. */
export const edition20260918: BulletinContent = {
  referenceDate: "2026-09-18",
  title: "Boletim Semanal do Cobre",
  subtitle: "LME & Mercado",
  headline: "Cobre sobe com retomada da China e dólar mais forte; estoques na LME crescem na semana",
  intro:
    "Acompanhe os principais fatores que influenciam o preço do cobre e como eles podem impactar os preços nos próximos dias.",
  coverImageUrl: "",
  copper: {
    value: 14529,
    previous: 14389.42,
    averages: [
      { label: "Semana anterior", note: "", value: 14509.38 },
      { label: "Mês atual", note: "setembro", value: 14366.42 },
      { label: "Mês anterior", note: "agosto", value: 14353.4 },
    ],
    source: "Shockmetais (referência LME)",
  },
  dollar: {
    value: 5.1521,
    previous: 5.0981,
    averages: [
      { label: "Semana anterior", note: "", value: 5.1059 },
      { label: "Mês atual", note: "setembro", value: 5.1308 },
      { label: "Mês anterior", note: "agosto", value: 5.1532 },
    ],
    source: "Investing.com",
  },
  stocks: {
    value: 255100,
    previous: 234475,
    previousDate: "2026-09-11",
    source: "LME (londonmetalexchange.com)",
  },
  direction: {
    bias: "alta",
    summary: "Os indicadores atuais apontam para pressão de alta no curto prazo, com volatilidade elevada.",
  },
  news: [
    {
      icon: "china",
      title: "Demanda da China",
      text: "A retomada das compras chinesas e sinais de estímulos econômicos voltaram a impulsionar a demanda por cobre.",
    },
    {
      icon: "oferta",
      title: "Oferta global",
      text: "Preocupações com a produção e a disponibilidade de cobre continuam dando suporte aos preços, com atenção a possíveis interrupções em minas e limitações na oferta.",
    },
    {
      icon: "estoque",
      title: "Estoques da LME",
      text: "Os estoques registraram alta na semana, passando de 234,5 mil toneladas (11/09) para 255,1 mil toneladas (18/09), o que ajuda a aliviar parte da pressão de alta no curto prazo.",
    },
    {
      icon: "juros",
      title: "EUA / política monetária",
      text: "A política monetária americana segue no radar, com decisões de bancos centrais, inflação e juros influenciando o dólar e as commodities.",
    },
    {
      icon: "geopolitica",
      title: "Geopolítica e tarifas",
      text: "As tensões comerciais envolvendo os EUA e a preocupação com a oferta física seguem gerando volatilidade no mercado.",
    },
  ],
  factorsUp: [
    "Continuidade da demanda da China.",
    "Riscos de novas interrupções na produção de minas.",
    "Possível manutenção de juros altos, fortalecendo o dólar e a busca por commodities.",
  ],
  factorsDown: [
    "Aumento da produção em minas (Peru/Chile).",
    "Sinais de desaceleração da economia global.",
    "Realização de lucros após fortes altas.",
    "Possível queda do dólar no curto prazo.",
  ],
  reading: {
    bias: "alta",
    text: "O cenário segue com tendência de alta, principalmente devido à demanda da China, queda nos estoques e riscos geopolíticos. O dólar permanece como fator de atenção, podendo intensificar a volatilidade.",
  },
  thermometer: [
    { icon: "cobre", indicator: "LME Cobre", situation: "Alta", impact: "alta" },
    { icon: "estoque", indicator: "Estoque LME", situation: "Em alta", impact: "baixa" },
    { icon: "china", indicator: "Demanda China", situation: "Forte", impact: "alta" },
    { icon: "dolar", indicator: "Dólar (USD/BRL)", situation: "Alta", impact: "alta" },
    { icon: "producao", indicator: "Produção de cobre", situation: "Normalização", impact: "baixa" },
    { icon: "economia", indicator: "Economia global", situation: "Estável", impact: "neutro" },
  ],
  priceImpact:
    "A valorização do cobre na LME, combinada à alta do dólar, tende a gerar maior pressão sobre o custo da matéria-prima em reais. Mesmo com eventuais ajustes na LME, o câmbio pode limitar uma redução efetiva dos preços no Brasil.",
  clientMessage:
    "Diante do cenário atual, recomendamos que clientes com pedidos em planejamento avaliem a antecipação de suas necessidades, especialmente para volumes maiores e projetos com entrega no curto prazo. Seguiremos acompanhando o mercado e comunicando qualquer alteração relevante.",
  sources: DEFAULT_SOURCES,
  author: { name: "Marco Moraes", role: "New Cabos" },
};

type DemoWeek = {
  date: string;
  copper: number;
  dollar: number;
  stocks: number;
  bias: BulletinContent["direction"]["bias"];
  headline: string;
};

/**
 * Semanas anteriores FICTÍCIAS, só para a demonstração ter histórico nos gráficos.
 * Rode `npm run db:seed -- --only-real` para carregar apenas a edição real de 18/09.
 */
export const demoWeeks: DemoWeek[] = [
  { date: "2026-07-24", copper: 14012.5, dollar: 5.2214, stocks: 198350, bias: "lateral", headline: "Cobre de lado à espera de dados da China; dólar recua" },
  { date: "2026-07-31", copper: 14188.75, dollar: 5.1987, stocks: 205900, bias: "alta", headline: "Estímulos chineses animam metais básicos e cobre avança" },
  { date: "2026-08-07", copper: 14402.1, dollar: 5.1702, stocks: 212400, bias: "alta", headline: "Cobre renova máxima do trimestre com oferta restrita no Chile" },
  { date: "2026-08-14", copper: 14296.3, dollar: 5.1455, stocks: 221150, bias: "lateral", headline: "Realização de lucros segura o cobre; estoques seguem subindo" },
  { date: "2026-08-21", copper: 14215.8, dollar: 5.1398, stocks: 229800, bias: "baixa", headline: "Dados fracos da indústria global pressionam o cobre" },
  { date: "2026-08-28", copper: 14331.9, dollar: 5.1661, stocks: 238600, bias: "lateral", headline: "Cobre recupera parte das perdas com dólar firme" },
  { date: "2026-09-04", copper: 14298.6, dollar: 5.1224, stocks: 241050, bias: "lateral", headline: "Semana de ajustes: cobre estável e real mais forte" },
  { date: "2026-09-11", copper: 14389.42, dollar: 5.0981, stocks: 234475, bias: "alta", headline: "Queda nos estoques da LME volta a dar suporte ao cobre" },
];
