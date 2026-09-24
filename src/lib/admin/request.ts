import "server-only";
import { headers } from "next/headers";

/** IP do visitante (na Vercel, o primeiro item de x-forwarded-for é definido pela plataforma). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "local";
}
