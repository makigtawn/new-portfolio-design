import { expect, test, type Page } from "@playwright/test";
import siteContent from "../../content/site.json";

const sensitiveConsolePattern = /hydrat|did not match|non-static position|Hydration/i;
const firstSlug = siteContent.projects[0]?.slug;
if (!firstSlug) throw new Error("At least one project is needed for console tests.");

function watchConsole(page: Page) {
  const messages: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (text === "[HMR] connected") return;
    if (message.type() === "error" || message.type() === "warning") {
      messages.push(`${message.type()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));
  return messages;
}

test.describe("hydration and Motion console regression", () => {
  for (const route of [
    "/",
    `/work/${firstSlug}`,
    "/admin/login",
    "/not-found",
  ]) {
    test(`has no hydration or position warnings on ${route}`, async ({ page }) => {
      const messages = watchConsole(page);
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await page.waitForTimeout(800);
      expect(messages.filter((message) => sensitiveConsolePattern.test(message))).toEqual(
        [],
      );
    });
  }

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("content remains visible without scroll or reveal animation", async ({
      page,
    }) => {
      const messages = watchConsole(page);
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const revealHeadings = page.locator(".reveal-heading");
      await expect(revealHeadings).toHaveCount(4);
      const headingStates = await revealHeadings.evaluateAll((nodes) =>
        nodes.map((node) => ({
          opacity: getComputedStyle(node).opacity,
          animation: getComputedStyle(node).animationName,
        })),
      );
      expect(headingStates.every((state) => state.opacity === "1")).toBe(true);
      expect(
        headingStates.every((state) => state.animation === "none"),
      ).toBe(true);
      const media = page.locator(".project-media-initial").first();
      await expect(media).toBeVisible();
      await expect(media).toHaveCSS("opacity", "1");
      await expect(page.locator(".marquee-track")).toHaveCSS(
        "animation-name",
        "none",
      );
      expect(messages.filter((message) => sensitiveConsolePattern.test(message))).toEqual(
        [],
      );
    });
  });
});
