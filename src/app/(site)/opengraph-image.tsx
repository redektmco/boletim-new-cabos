import { listPublished } from "@/lib/bulletins";
import { OG_SIZE, renderBulletinOg } from "@/lib/og";

export const alt = "Boletim do Cobre — New Cabos";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image() {
  const [latest] = await listPublished();
  return renderBulletinOg(latest?.content ?? null);
}
