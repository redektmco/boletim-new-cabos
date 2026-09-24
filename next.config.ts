import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL usa bindings nativos para arquivos locais; não deve ser empacotado.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // fontes lidas do disco pelas imagens de compartilhamento (src/lib/og.tsx)
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/**"],
    "/boletim/[slug]/opengraph-image": ["./assets/fonts/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
