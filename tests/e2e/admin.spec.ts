import { expect, test, type Page } from "@playwright/test";
import siteContent from "../../content/site.json";

let testAddress = 10;

test.beforeEach(async ({ page, request }) => {
  testAddress = (testAddress % 200) + 10;
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.51.100.${testAddress}`,
  });
  await request.post("http://127.0.0.1:4010/__reset");
});

async function logIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function profileEditor(page: Page) {
  const editor = page.getByRole("textbox", {
    name: "Profile content as JSON",
  });
  await expect(editor).toBeVisible();
  return editor;
}

async function modifyProfile(page: Page, change: (profile: typeof siteContent.profile) => void) {
  const editor = await profileEditor(page);
  const profile = JSON.parse(await editor.inputValue()) as typeof siteContent.profile;
  change(profile);
  await editor.fill(JSON.stringify(profile, null, 2));
  return editor;
}

test.describe("admin behavior against mock GitHub Contents API", () => {
  test("redirects logged-out visits to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Sign in to edit.",
    );
  });

  test("wrong passwords stay generic and the sixth attempt is rate limited", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    const password = page.getByLabel("Password");
    const submit = page.getByRole("button", { name: "Sign in" });
    const alert = page.getByRole("alert");
    const generic = "Unable to sign in. Check the password and try again.";

    for (let attempt = 1; attempt <= 6; attempt += 1) {
      await password.fill(`wrong-${attempt}`);
      const responsePromise = page.waitForResponse(
        (response) => response.url().endsWith("/api/admin/login"),
      );
      await submit.click();
      const response = await responsePromise;
      await expect(alert).toHaveText(generic);
      if (attempt < 6) expect(response.status()).toBe(401);
      else expect(response.status()).toBe(429);
    }
  });

  test("correct login issues a Secure, HTTP-only, Strict eight-hour cookie", async ({
    page,
    context,
  }) => {
    await logIn(page);
    const cookie = (await context.cookies()).find(
      (item) => item.name === "portfolio_admin_session",
    );
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.secure).toBe(true);
    expect(cookie?.sameSite).toBe("Strict");
    expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + 7 * 60 * 60);
  });

  test("warns before leaving with unsaved edits", async ({ page }) => {
    await logIn(page);
    await modifyProfile(page, (profile) => {
      profile.proofPoint += " Updated in test.";
    });
    let dialogMessage = "";
    page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message;
      await dialog.dismiss();
    });
    await page.getByRole("link", { name: "Preview public site" }).click();
    expect(dialogMessage).toContain("unsaved edits");
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("shows an inline validation error for a malformed email", async ({
    page,
  }) => {
    await logIn(page);
    const editor = await modifyProfile(page, (profile) => {
      profile.email = "not-an-email";
    });
    await page.getByRole("button", { name: "Validate section" }).first().click();
    const alert = page.getByRole("alert");
    await expect(alert).toContainText(/email/i);
    await expect(editor).toHaveAttribute("aria-invalid", "true");
  });

  test("saves valid content as a mock GitHub commit", async ({ page, request }) => {
    await logIn(page);
    await modifyProfile(page, (profile) => {
      profile.proofPoint = "Changed proof point for mock commit.";
    });
    await page.getByRole("button", { name: "Save all changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved to GitHub");

    const commits = (await (
      await request.get("http://127.0.0.1:4010/__commits")
    ).json()) as Array<{ path: string; content: string }>;
    expect(commits).toHaveLength(1);
    expect(commits[0]?.path).toBe("content/site.json");
    expect(commits[0]?.content).toContain("Changed proof point for mock commit.");
  });

  test("shows a clear 409 if GitHub rejects the SHA without overwriting", async ({
    page,
    request,
  }) => {
    await logIn(page);
    await modifyProfile(page, (profile) => {
      profile.proofPoint = "This stale edit must not commit.";
    });
    await request.post("http://127.0.0.1:4010/__conflict-next");
    await page.getByRole("button", { name: "Save all changes" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "changed on GitHub before this save completed",
    );
    const commits = await (
      await request.get("http://127.0.0.1:4010/__commits")
    ).json();
    expect(commits).toEqual([]);
  });

  test("uploads a valid JPEG and rejects an executable named .jpg", async ({
    page,
    request,
  }) => {
    await logIn(page);
    const jpegUrl = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/jpeg", 0.8);
    });
    const jpeg = Buffer.from(jpegUrl.split(",")[1] ?? "", "base64");
    const input = page.getByLabel("Choose a JPEG, PNG, or WebP image");
    await input.setInputFiles({ name: "pixel.jpg", mimeType: "image/jpeg", buffer: jpeg });
    await expect(page.getByRole("status")).toContainText("Uploaded");

    const commitsBeforeInvalidFile = (await (
      await request.get("http://127.0.0.1:4010/__commits")
    ).json()) as Array<{ path: string }>;
    expect(commitsBeforeInvalidFile.some((commit) => commit.path.startsWith("public/uploads/"))).toBe(true);

    await input.setInputFiles({
      name: "program.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("MZ executable disguised as JPEG"),
    });
    await expect(page.getByRole("status")).toContainText(
      "valid JPEG, PNG, or WebP",
    );
    const commitsAfterInvalidFile = await (
      await request.get("http://127.0.0.1:4010/__commits")
    ).json();
    expect(commitsAfterInvalidFile).toHaveLength(commitsBeforeInvalidFile.length);
  });

  test("rejects an oversized image and logs out", async ({ page, context }) => {
    await logIn(page);
    const input = page.getByLabel("Choose a JPEG, PNG, or WebP image");
    await input.setInputFiles({
      name: "too-large.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 0xff),
    });
    await expect(page.getByRole("status")).toContainText("smaller than 2 MB");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    expect(
      (await context.cookies()).some(
        (item) => item.name === "portfolio_admin_session",
      ),
    ).toBe(false);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
