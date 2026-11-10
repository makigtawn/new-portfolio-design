import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

if (existsSync(".env.test")) process.loadEnvFile(".env.test");

const mode = process.env.PLAYWRIGHT_SERVER_MODE ?? "dev";
const port = process.env.PORT ?? "3020";
const adminPassword = process.env.ADMIN_PASSWORD;
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;
const githubRepo = process.env.GITHUB_REPO;
if (!adminPassword || !adminSessionSecret || !githubRepo) {
  throw new Error(
    "Copy .env.test.example to .env.test before running Playwright.",
  );
}
process.env.ADMIN_PASSWORD = adminPassword;
process.env.ADMIN_SESSION_SECRET = adminSessionSecret;
process.env.GITHUB_API_URL ??= "http://127.0.0.1:4010";

const serverHost = "127.0.0.1";
const appUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const serverCommand =
  mode === "production"
    ? `npm run start -- --hostname ${serverHost} --port ${port}`
    : `npm run dev -- --hostname ${serverHost} --port ${port}`;
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: ".",
  testMatch: ["e2e/**/*.spec.ts", "tests/e2e/**/*.spec.ts"],
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: appUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: browserPath ? { executablePath: browserPath } : undefined,
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      command: "node --experimental-strip-types tests/mocks/github-server.ts",
      url: "http://127.0.0.1:4010/__health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        GITHUB_REPO: githubRepo,
        MOCK_GITHUB_PORT: "4010",
      },
    },
    {
      command: serverCommand,
      url: appUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        ADMIN_PASSWORD: adminPassword,
        ADMIN_SESSION_SECRET: adminSessionSecret,
        GITHUB_REPO: githubRepo,
        GITHUB_API_URL: process.env.GITHUB_API_URL,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? "test-token",
        GITHUB_BRANCH: process.env.GITHUB_BRANCH ?? "main",
        NEXT_PUBLIC_SITE_URL:
          process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${port}`,
      },
    },
  ],
});
