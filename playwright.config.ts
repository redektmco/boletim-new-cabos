import { defineConfig, devices } from "@playwright/test";

/**
 * Testes ponta a ponta. Sobem um `next dev` próprio com um banco separado (data/e2e.db),
 * recriado a cada execução com a edição real + histórico de demonstração.
 * Pare outro `next dev` deste projeto antes de rodar (o Next permite um por pasta).
 */
const PORT = Number(process.env.E2E_PORT ?? 3300);
const env = {
  DATABASE_URL: "file:./data/e2e.db",
  SESSION_SECRET: "e2e-secret-e2e-secret-e2e-secret-0000",
  ADMIN_NAME: "Marco Moraes",
  ADMIN_EMAIL: "marco@newcabos.com.br",
  ADMIN_PASSWORD: "newcabos123",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
};

// e2e/admin.spec.ts entra no painel com o admin que o servidor de teste cria
process.env.E2E_ADMIN_EMAIL ??= env.ADMIN_EMAIL;
process.env.E2E_ADMIN_PASSWORD ??= env.ADMIN_PASSWORD;

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "pt-BR",
    // Em ambientes com Chromium pré-instalado, aponte PLAYWRIGHT_CHROMIUM_PATH para ele.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /site\.spec\.ts/ },
  ],
  webServer: {
    command: `tsx scripts/e2e-reset.ts && npm run setup && next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
