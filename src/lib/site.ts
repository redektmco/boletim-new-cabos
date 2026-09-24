/**
 * URL pública: NEXT_PUBLIC_SITE_URL, se definida; na Vercel, o domínio de produção do projeto
 * (acompanha automaticamente um domínio próprio); em desenvolvimento, localhost.
 */
function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Dados institucionais exibidos no site público. */
export const site = {
  name: "New Cabos",
  product: "Boletim do Cobre",
  tagline: "Cabos de energia fotovoltaica",
  description:
    "Boletim semanal da New Cabos com o preço do cobre na LME, dólar, estoques e o que isso significa para o preço dos cabos fotovoltaicos.",
  url: siteUrl(),
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
