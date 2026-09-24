import { parseArgs } from "node:util";
import { seedEditions } from "./seed-lib";
import { client, db } from "./_db";

/**
 * Carrega a edição real de 18/09/2026 e (por padrão) semanas fictícias anteriores para os gráficos.
 *   npm run db:seed               → real + demonstração
 *   npm run db:seed -- --only-real
 * Edições cuja data já existe no banco são ignoradas.
 */
async function main() {
  const { values } = parseArgs({ options: { "only-real": { type: "boolean", default: false } } });
  const { inserted, skipped } = await seedEditions(db, { includeDemo: !values["only-real"] });
  console.log(`✓ ${inserted} edição(ões) inserida(s), ${skipped} já existiam.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
