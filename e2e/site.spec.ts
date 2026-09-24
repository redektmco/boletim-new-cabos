import { expect, test } from "@playwright/test";

test.describe("site público", () => {
  test("home destaca a última edição e leva ao boletim completo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Boletim do Cobre" })).toBeVisible();

    const featured = page.getByRole("link", { name: /Cobre sobe com retomada da China/ }).first();
    await expect(featured).toBeVisible();
    await featured.click();

    await expect(page).toHaveURL(/\/boletim\/2026-09-18$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cobre sobe com retomada da China");
    await expect(page.getByText("US$ 14.529,00", { exact: true })).toBeVisible();
    // variação calculada automaticamente a partir do valor anterior
    await expect(page.getByText("+0,97%").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Termômetro do mercado" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "O que isso significa para você" })).toBeVisible();
  });

  test("página da edição não tem rolagem horizontal", async ({ page }) => {
    await page.goto("/boletim/2026-09-18");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("histórico alterna indicador e mostra tabela", async ({ page, isMobile }) => {
    test.skip(isMobile, "interação de gráfico testada no desktop");
    await page.goto("/#historico");
    await page.getByRole("tab", { name: "Dólar" }).click();
    await expect(page.getByRole("tab", { name: "Dólar" })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("button", { name: "Tabela" }).click();
    await expect(page.getByRole("table")).toContainText("18/09/2026");
  });

  test("filtro de edições por viés", async ({ page }) => {
    await page.goto("/boletins");
    await page.getByRole("button", { name: /Viés de baixa/ }).click();
    await expect(page.getByRole("link", { name: /Dados fracos da indústria global/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Queda nos estoques da LME/ })).toHaveCount(0);
  });

  test("imagem de compartilhamento e 404", async ({ page, request }) => {
    await page.goto("/boletim/2026-09-18");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toBeTruthy();
    const res = await request.get(ogImage!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");

    const missing = await page.goto("/boletim/1999-01-01");
    expect(missing?.status()).toBe(404);
  });
});
