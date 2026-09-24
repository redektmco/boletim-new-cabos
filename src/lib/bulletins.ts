import "server-only";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bulletins, type BulletinRow } from "@/lib/db/schema";
import { bulletinContentSchema, type BulletinContent, type BulletinStatus } from "@/lib/bulletin/schema";
import type { HistoryPoint } from "@/lib/bulletin/types";

export type { HistoryPoint };

export type PublishedBulletin = BulletinRow & { editionNumber: number };

// ---------------------------------------------------------------------------
// Leitura pública (somente edições publicadas)
// ---------------------------------------------------------------------------

const published = eq(bulletins.status, "published");

/** Todas as edições publicadas, da mais recente para a mais antiga, com número da edição. */
export async function listPublished(): Promise<PublishedBulletin[]> {
  const rows = await db.select().from(bulletins).where(published).orderBy(desc(bulletins.referenceDate), desc(bulletins.id));
  return rows.map((row, i) => ({ ...row, editionNumber: rows.length - i }));
}

export async function getPublishedBySlug(slug: string) {
  const all = await listPublished();
  const index = all.findIndex((b) => b.slug === slug);
  if (index === -1) return null;
  return {
    bulletin: all[index],
    newer: index > 0 ? all[index - 1] : null,
    older: all[index + 1] ?? null,
    history: toHistory(all),
  };
}

/** Série histórica em ordem cronológica, para gráficos e sparklines. */
export function toHistory(rows: BulletinRow[]): HistoryPoint[] {
  return rows
    .map((row) => ({
      slug: row.slug,
      referenceDate: row.referenceDate,
      copper: row.content.copper.value,
      dollar: row.content.dollar.value,
      stocks: row.content.stocks.value,
      bias: row.content.direction.bias,
    }))
    .sort((a, b) => a.referenceDate.localeCompare(b.referenceDate));
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

export async function listAllForAdmin() {
  return db
    .select({
      id: bulletins.id,
      slug: bulletins.slug,
      status: bulletins.status,
      referenceDate: bulletins.referenceDate,
      headline: bulletins.headline,
      updatedAt: bulletins.updatedAt,
      publishedAt: bulletins.publishedAt,
      bias: sql<BulletinContent["direction"]["bias"]>`json_extract(${bulletins.content}, '$.direction.bias')`,
    })
    .from(bulletins)
    .orderBy(desc(bulletins.referenceDate), desc(bulletins.id));
}

export async function getBulletinById(id: number) {
  return (await db.query.bulletins.findFirst({ where: eq(bulletins.id, id) })) ?? null;
}

/** Edição mais recente (qualquer status) — base para "nova edição". */
export async function getLatestBulletin() {
  return (await db.query.bulletins.findFirst({ orderBy: [desc(bulletins.referenceDate), desc(bulletins.id)] })) ?? null;
}

/** Série histórica completa (inclui rascunhos) para o preview do editor. */
export async function getHistoryForAdmin() {
  const rows = await db.select().from(bulletins).orderBy(asc(bulletins.referenceDate));
  return toHistory(rows);
}

async function uniqueSlug(referenceDate: string, excludeId?: number) {
  const base = referenceDate;
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const clash = await db.query.bulletins.findFirst({
      columns: { id: true },
      where: excludeId ? and(eq(bulletins.slug, candidate), ne(bulletins.id, excludeId)) : eq(bulletins.slug, candidate),
    });
    if (!clash) return candidate;
  }
  throw new Error("Não foi possível gerar um endereço único para esta edição.");
}

export async function createBulletin(input: unknown, status: BulletinStatus, userId: number) {
  const content = bulletinContentSchema.parse(input);
  const slug = await uniqueSlug(content.referenceDate);
  const [row] = await db
    .insert(bulletins)
    .values({
      slug,
      status,
      referenceDate: content.referenceDate,
      headline: content.headline,
      content,
      publishedAt: status === "published" ? new Date() : null,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();
  revalidateBulletinPages();
  return row;
}

export async function updateBulletin(id: number, input: unknown, status: BulletinStatus, userId: number) {
  const content = bulletinContentSchema.parse(input);
  const current = await getBulletinById(id);
  if (!current) throw new Error("Edição não encontrada.");

  // O endereço acompanha a data de referência enquanto a edição não foi publicada;
  // depois de publicada, o link não muda (pode já ter sido enviado a clientes).
  const slug =
    current.status === "draft" && current.referenceDate !== content.referenceDate
      ? await uniqueSlug(content.referenceDate, id)
      : current.slug;

  const [row] = await db
    .update(bulletins)
    .set({
      slug,
      status,
      referenceDate: content.referenceDate,
      headline: content.headline,
      content,
      publishedAt: status === "published" ? (current.publishedAt ?? new Date()) : null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(bulletins.id, id))
    .returning();

  revalidateBulletinPages();
  return row;
}

export async function setBulletinStatus(id: number, status: BulletinStatus, userId: number) {
  const current = await getBulletinById(id);
  if (!current) throw new Error("Edição não encontrada.");
  return updateBulletin(id, current.content, status, userId);
}

export async function deleteBulletin(id: number) {
  const [row] = await db.delete(bulletins).where(eq(bulletins.id, id)).returning({ slug: bulletins.slug });
  if (row) revalidateBulletinPages();
}

/**
 * Atualiza as páginas públicas após uma alteração. Uma edição mexe na home, no arquivo, na navegação e no
 * número de todas as outras edições, no sitemap e nas imagens de compartilhamento — então revalida tudo
 * (são poucas páginas, e só acontece quando alguém salva no painel).
 */
export function revalidateBulletinPages() {
  revalidatePath("/", "layout");
}
