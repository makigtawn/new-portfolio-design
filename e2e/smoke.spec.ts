import { expect, test } from "@playwright/test";

const correctPassword = process.env.ADMIN_PASSWORD;
if (!correctPassword) {
  throw new Error("ADMIN_PASSWORD must be set for Playwright tests.");
}

test("home page loads and shows the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "I build software that solves real problems.",
  );
  await expect(
    page.getByRole("link", { name: "See what I've built" }),
  ).toBeVisible();
});

test("project navigation opens the clinic case study with footer", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Clinic Queue Manager/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/work\/clinic-queue-manager$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Clinic Queue Manager",
  );
  await expect(page.locator("footer")).toBeVisible();
});

test("public pages share consistent layout without horizontal overflow", async ({
  page,
}) => {
  for (const width of [360, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/work/clinic-queue-manager",
      "/not-found",
      "/error",
    ]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main").length,
      }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(dimensions.h1Count).toBe(1);
      expect(dimensions.mainCount).toBe(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  }
});

test("mobile navigation popover opens inside viewport and closes on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  const menu = page.locator("#site-menu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThan(40);
  expect(box!.y + box!.height).toBeLessThan(844);
  await expect(menu.getByRole("link")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await menuButton.click();
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Work" }).click();
  await expect(menu).not.toBeVisible();
});

test("login page toggles password visibility without breaking input label", async ({
  page,
}) => {
  await page.goto("/admin/login");
  const input = page.getByLabel("Password");
  await expect(input).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show characters" }).click();
  await expect(input).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide characters" }).click();
  await expect(input).toHaveAttribute("type", "password");
});

test("sitemap excludes removed notes routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).toContain("/work/clinic-queue-manager");
  expect(xml).not.toContain("/notes");
});

test("admin redirects when logged out", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sign in to edit.",
  );
});

test("wrong password shows a generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByText("Unable to sign in. Check the password and try again."),
  ).toHaveText("Unable to sign in. Check the password and try again.");
});

test("right password opens the content editor", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(correctPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Content editor",
  );
  await expect(
    page.getByRole("button", { name: "Save all changes" }),
  ).toBeVisible();
});
