import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { bulletinContentSchema, type BulletinContent } from "../src/lib/bulletin/schema";
import * as schema from "../src/lib/db/schema";
import { demoWeeks, edition20260918 } from "./seed-data";

type Db = LibSQLDatabase<typeof schema>;

/** Semanas fictícias anteriores a 18/09, montadas a partir da edição real (só para ilustrar o histórico). */
function demoEditions(): BulletinContent[] {
  return demoWeeks.map((week, i) => {
    const prev = demoWeeks[i - 1];
    return {
      ...structuredClone(edition20260918),
      referenceDate: week.date,
      headline: week.headline,
      intro: "Edição de demonstração — dados fictícios gerados para ilustrar o histórico.",
      copper: { ...edition20260918.copper, value: week.copper, previous: prev?.copper ?? null, averages: [] },
      dollar: { ...edition20260918.dollar, value: week.dollar, previous: prev?.dollar ?? null, averages: [] },
      stocks: { ...edition20260918.stocks, value: week.stocks, previous: prev?.stocks ?? null, previousDate: prev?.date ?? "" },
      direction: { ...edition20260918.direction, bias: week.bias, summary: "Edição de demonstração com dados fictícios." },
      reading: { ...edition20260918.reading, bias: week.bias },
    };
  });
}

/** Insere a edição real de 18/09/2026 (e, opcionalmente, o histórico fictício). Datas já existentes são ignoradas. */
export async function seedEditions(db: Db, { includeDemo }: { includeDemo: boolean }) {
  const author = await db.query.users.findFirst();
  const editions = [...(includeDemo ? demoEditions() : []), edition20260918];

  let inserted = 0;
  for (const edition of editions) {
    const content = bulletinContentSchema.parse(edition);
    const exists = await db.query.bulletins.findFirst({ where: eq(schema.bulletins.slug, content.referenceDate) });
    if (exists) continue;
    const publishedAt = new Date(`${content.referenceDate}T12:00:00-03:00`);
    await db.insert(schema.bulletins).values({
      slug: content.referenceDate,
      status: "published",
      referenceDate: content.referenceDate,
      headline: content.headline,
      content,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      createdBy: author?.id ?? null,
      updatedBy: author?.id ?? null,
    });
    inserted++;
  }
  return { inserted, skipped: editions.length - inserted };
}
