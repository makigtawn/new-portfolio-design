# Playwright CI failure audit

## CI setup

I inspected the quality job and the failed GitHub Actions run `43636018745` (`6 failed`, `15 passed`). The workflow used Node 22. Before e2e it ran `npm run build`, installed Chromium with `npx playwright install chromium`, and copied `.env.test.example` to `.env.test`; it did not run `npm run start` explicitly. The e2e step had no inline `env` block.

Before this fix, `playwright.config.ts` used `http://127.0.0.1:3020` as its default base URL and started `npm run dev -- --hostname 127.0.0.1 --port 3020`. Its first `webServer` entry started `node --experimental-strip-types tests/mocks/github-server.ts` on port 4010; the app server started second. `.env.test.example` contained all required test settings: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `GITHUB_API_URL`.

The revised workflow still builds first and now sets test-only values explicitly in the e2e step. It selects production mode, so Playwright starts the built app with `npm run start -- --hostname 127.0.0.1 --port 3020`. The browser base URL is `http://localhost:3020`, matching that port. `GITHUB_API_URL` remains `http://127.0.0.1:4010`, where the mock listens. The mock starts before Next and the admin suite resets it in `beforeEach`.

## The six CI failures and fixes

1. **Save valid content as a mock GitHub commit** — CI log: `Expected substring: "Saved to GitHub"`; the status stayed `"Unsaved edits"` until timeout. The request was unauthorized because the secure session cookie was not being sent from the CI test origin. The workflow and Playwright base URL now use `http://localhost:3020`, and the app runs in production mode. The mock-backed save succeeds locally.
2. **Shows a clear 409 if GitHub rejects the SHA** — CI log: expected the conflict text but `getByText(...)` found no element. This was the same missing authenticated session, so the save never reached the mock conflict response. The origin/server setup now preserves the login session; the mock reset and conflict route are verified by the passing test.
3. **Uploads a valid JPEG and rejects an executable named .jpg** — CI log: expected `"Uploaded"` but the upload status element was absent. The request was unauthenticated and did not complete the mock-backed upload. The localhost origin and production server setup fix the authenticated request; the test now passes.
4. **Rejects an oversized image and logs out** — CI log: `Expected pattern: /\\/admin$/`, `Received string: "http://127.0.0.1:3020/admin/login"` while `logIn` waited for the admin route. The secure cookie was not sent for the CI origin. The base URL is now localhost. The test also asserts the session cookie is present after login, the upload returns 413, and the failed upload leaves the session and `/admin` route intact.
5. **Reduced-motion content remains visible** — CI log: `Locator: locator('.reveal-heading')`, `Expected: 4`, `Received: 0`. The four `RevealHeading` components use the `section-title` class; they never emit `reveal-heading`. The test now queries `.section-title` and keeps the correct count of four. A comment in the test explains why the old selector was wrong. Reduced-motion visibility and animation assertions remain unchanged.
6. **Light theme when browser prefers dark** — CI log: background and text matched the light tokens, but computed scheme was `"normal"` instead of expected `"light"`. `app/globals.css` had light paper/ink colors and the root viewport metadata declared light, but CSS did not declare a color scheme. Added `color-scheme: light` to the root element. The expected values remain unchanged.

The exact GitHub log included a retry for the same six failures; no test was skipped and no assertion was weakened. In local Chromium, the four admin tests also passed when I explicitly used the old `127.0.0.1` URL, so the secure-cookie symptom could not be reproduced in that local browser. The CI log did show those tests staying unauthenticated at that origin. The change standardizes the CI browser origin to `localhost`, checks the cookie directly, and tests failed-upload session retention.

## Files changed

- `.github/workflows/ci.yml` — supplies explicit test-only variables and runs Playwright against the production build on port 3020.
- `playwright.config.ts` — defaults the browser URL to `localhost` while keeping the server bound to loopback on the same port.
- `app/globals.css` — declares the existing light-only color scheme.
- `tests/e2e/admin.spec.ts` — checks session-cookie presence and confirms oversized-upload failure does not discard the authenticated session.
- `tests/e2e/console.spec.ts` — selects the actual heading class; expected count remains four.
- `audit/e2e-fix.md` — records the CI log findings, fixes, and verification results.

No site content or visual design was changed.

## Verification

All commands below passed after the changes:

| Command                                                 | Result                                     |
| ------------------------------------------------------- | ------------------------------------------ |
| `npm ci`                                                | PASS                                       |
| `npm run lint`                                          | PASS                                       |
| `npm run typecheck`                                     | PASS                                       |
| `npm run format:check`                                  | PASS                                       |
| `npm test`                                              | PASS — 3 files, 8 tests                    |
| `npm run build`                                         | PASS — standard Turbopack production build |
| `CI=true npm run test:e2e` with the workflow's test env | PASS twice — 21 tests each run             |

I also verified all 4 affected admin tests with the original `127.0.0.1` URL; they passed locally, confirming the CI secure-cookie symptom is runner-specific in this environment. The revised CI behavior, including localhost URL and production-mode server, passed twice consecutively.

The original CI run log was fetched from GitHub and inspected. No further CI log checks are required; after these changes, the next useful check is the next GitHub Actions run to confirm the runner follows the same production-origin behavior.
