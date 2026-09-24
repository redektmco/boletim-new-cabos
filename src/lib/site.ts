/** Dados institucionais exibidos no site público. */
export const site = {
  name: "New Cabos",
  product: "Boletim do Cobre",
  tagline: "Cabos de energia fotovoltaica",
  description:
    "Boletim semanal da New Cabos com o preço do cobre na LME, dólar, estoques e o que isso significa para o preço dos cabos fotovoltaicos.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5515996099494",
  phones: ["(15) 99609-9494", "(15) 99755-6534"],
  email: "contato@newcabos.com.br",
  address: "Rua Joaquim Machado, 250 — Sorocaba/SP — 18087-280",
  hours: "Segunda a sexta, das 8h às 18h",
  links: {
    website: "https://www.newcabos.com.br",
    instagram: "https://www.instagram.com/newcabosolar/",
    facebook: "https://www.facebook.com/newcabosolar/",
  },
};

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
