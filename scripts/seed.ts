import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { bulletinContentSchema, type BulletinContent } from "../src/lib/bulletin/schema";
import { demoWeeks, edition20260918 } from "./seed-data";
import { client, db, schema } from "./_db";

/**
 * Carrega a edição real de 18/09/2026 e (por padrão) semanas fictícias anteriores para os gráficos.
 *   npm run db:seed               → real + demonstração
 *   npm run db:seed -- --only-real
 * Edições cuja data já existe no banco são ignoradas.
 */
async function main() {
  const { values } = parseArgs({ options: { "only-real": { type: "boolean", default: false } } });
  const author = await db.query.users.findFirst();

  const editions: BulletinContent[] = [];
  if (!values["only-real"]) {
    demoWeeks.forEach((week, i) => {
      const prev = demoWeeks[i - 1];
      editions.push({
        ...structuredClone(edition20260918),
        referenceDate: week.date,
        headline: week.headline,
        copper: { ...edition20260918.copper, value: week.copper, previous: prev?.copper ?? null, averages: [] },
        dollar: { ...edition20260918.dollar, value: week.dollar, previous: prev?.dollar ?? null, averages: [] },
        stocks: { ...edition20260918.stocks, value: week.stocks, previous: prev?.stocks ?? null, previousDate: prev?.date ?? "" },
        direction: { ...edition20260918.direction, bias: week.bias, summary: "Edição de demonstração com dados fictícios." },
        reading: { ...edition20260918.reading, bias: week.bias },
        intro: "Edição de demonstração — dados fictícios gerados para ilustrar o histórico.",
      });
    });
  }
  editions.push(edition20260918);

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
  console.log(`✓ ${inserted} edição(ões) inserida(s), ${editions.length - inserted} já existiam.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
