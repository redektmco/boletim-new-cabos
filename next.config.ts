import type { NextConfig } from "next";

// Modo demonstração (Vercel sem banco configurado): o arquivo SQLite gerado no build vai junto no deploy.
const demoMode = Boolean(process.env.VERCEL) && !process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL;
const fonts = ["./assets/fonts/**"];

const nextConfig: NextConfig = {
  // libSQL usa bindings nativos para arquivos locais; não deve ser empacotado.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // fontes lidas do disco pelas imagens de compartilhamento (src/lib/og.tsx)
  outputFileTracingIncludes: {
    "/opengraph-image": fonts,
    "/boletim/[slug]/opengraph-image": fonts,
    ...(demoMode ? { "/*": ["./data/boletim.db"], "/**": ["./data/boletim.db"] } : {}),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
