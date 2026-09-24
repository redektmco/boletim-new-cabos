import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/bulletins";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const editions = await listPublished();
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1, lastModified: editions[0]?.updatedAt },
    { url: absoluteUrl("/boletins"), changeFrequency: "weekly", priority: 0.7 },
    ...editions.map((e) => ({
      url: absoluteUrl(`/boletim/${e.slug}`),
      lastModified: e.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
