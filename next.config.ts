import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL usa bindings nativos para arquivos locais; não deve ser empacotado.
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // capas enviadas pelo editor passam pela rota /api/upload, não por Server Actions
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
