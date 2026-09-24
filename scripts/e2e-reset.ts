import { readdirSync, rmSync } from "node:fs";

// Apaga o banco usado pelos testes E2E para cada execução começar do zero.
for (const file of readdirSync("data")) {
  if (file.startsWith("e2e.db")) rmSync(`data/${file}`);
}
