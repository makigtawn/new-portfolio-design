import { expect, test } from "@playwright/test";

test("light theme is used even when browser prefers dark", async ({
  browser,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(() => ({
          background: getComputedStyle(document.body).backgroundColor,
          color: getComputedStyle(document.body).color,
          scheme: getComputedStyle(document.documentElement).colorScheme,
        })),
      )
      .toEqual({
        background: "rgb(246, 243, 238)",
        color: "rgb(27, 26, 23)",
        scheme: "light",
      });
    await context.close();
  }
});
