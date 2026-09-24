import { getPublishedBySlug } from "@/lib/bulletins";
import { OG_SIZE, renderBulletinOg } from "@/lib/og";

export const alt = "Resumo do Boletim do Cobre da New Cabos";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublishedBySlug(slug);
  return renderBulletinOg(data?.bulletin.content ?? null);
}
