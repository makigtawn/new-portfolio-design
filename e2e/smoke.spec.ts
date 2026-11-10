import { expect, test } from "@playwright/test";

const correctPassword = process.env.ADMIN_PASSWORD;
if (!correctPassword) {
  throw new Error("ADMIN_PASSWORD must be set for Playwright tests.");
}

test("home page loads and shows the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "I build useful software",
  );
  await expect(
    page.getByRole("link", { name: "Explore selected work" }),
  ).toBeVisible();
});

test("project navigation opens the clinic case study", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Clinic Queue Manager/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/work\/clinic-queue-manager$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Clinic Queue Manager",
  );
});

test("home layout fits the requested viewport widths", async ({ page }) => {
  for (const width of [360, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
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
  await expect(page.getByRole("alert")).toHaveText(
    "Unable to sign in. Check the password and try again.",
  );
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
