import { existsSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Fluxo principal do painel: entrar → criar edição (pré-preenchida) → salvar rascunho →
 * publicar pela lista → conferir no site → despublicar → excluir.
 * Usa ADMIN_EMAIL / ADMIN_PASSWORD (lidos do .env.local quando existir).
 */

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const email = process.env.E2E_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "marco@newcabos.com.br";
const password = process.env.E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("painel do boletim", () => {
  test.skip(!password, "Defina ADMIN_PASSWORD (ou E2E_ADMIN_PASSWORD) para rodar os testes do painel.");

  test("login inválido mostra mensagem genérica", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill(email);
    await page.locator("#password").fill("senha-errada-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator("#login-error")).toHaveText("E-mail ou senha incorretos.");
  });

  test("criar, publicar, despublicar e excluir uma edição", async ({ page, request }) => {
    const headline = `Teste automatizado ${Date.now()}`;
    await login(page);

    // Nova edição, pré-preenchida a partir da última
    await page.getByRole("link", { name: "Nova edição" }).first().click();
    await expect(page).toHaveURL(/\/admin\/boletins\/novo/);
    const previousCopper = page.locator("#campo-copper-previous");
    await expect(previousCopper).not.toHaveValue("");

    // Salvar sem manchete: validação leva ao campo
    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await expect(page.locator("#campo-headline")).toBeFocused();
    await expect(page.locator("#campo-headline-error")).toBeVisible();

    await page.locator("#campo-headline").fill(headline);
    await page.locator("#campo-copper-value").fill("15.012,50");
    await page.locator("#campo-copper-value").blur();
    await expect(page.locator("#campo-copper-value")).toHaveValue("15.012,50");
    // pré-visualização acompanha o formulário
    await expect(page.locator("#painel-preview h1")).toHaveText(headline);

    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await expect(page).toHaveURL(/\/admin\/boletins\/\d+$/);
    await expect(page.getByText("Rascunho salvo.")).toBeVisible();

    // Publicar pela lista
    await page.getByRole("link", { name: "Edições" }).first().click();
    const row = page.locator("li", { hasText: headline });
    await row.getByRole("button", { name: /Mais ações/ }).click();
    await page.getByRole("menuitem", { name: "Publicar" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Publicar agora" }).click();
    await expect(page.getByText("Edição publicada! Já está no site.")).toBeVisible();

    await expect(row.getByText("Publicado").filter({ visible: true })).toBeVisible();
    await row.getByRole("button", { name: /Mais ações/ }).click();
    const href = await page.getByRole("menuitem", { name: "Ver no site" }).getAttribute("href");
    await page.keyboard.press("Escape");
    expect(href).toMatch(/^\/boletim\//);
    const published = await request.get(href!);
    expect(published.status()).toBe(200);
    expect(await published.text()).toContain(headline);

    // Despublicar e excluir pelo editor
    await row.getByRole("link", { name: /Editar/ }).click();
    await expect(page).toHaveURL(/\/admin\/boletins\/\d+$/);
    await page.getByRole("button", { name: "Mais ações da edição" }).click();
    await page.getByRole("menuitem", { name: "Despublicar" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Despublicar" }).click();
    await expect(page.getByText("Edição despublicada.", { exact: false })).toBeVisible();
    expect((await request.get(href!)).status()).toBe(404);

    await page.getByRole("button", { name: "Mais ações da edição" }).click();
    await page.getByRole("menuitem", { name: "Excluir edição" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Excluir edição" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("li", { hasText: headline })).toHaveCount(0);
  });
});
