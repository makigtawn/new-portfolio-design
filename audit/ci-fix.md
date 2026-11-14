# CI quality job fix audit

## Failing step and root cause

The repository did not contain the GitHub Actions log for run `43632919406`, so the quality steps were reproduced locally. The first reproducible quality failure was **Lint** (`npm run lint`), which exited 1 with three `react-hooks/set-state-in-effect` errors:

- `components/home/project-media.tsx:22`: `useEffect(() => setMounted(true), [])`
- `components/layout/reading-progress.tsx:10`: `useEffect(() => setMounted(true), [])`
- `components/layout/reveal-heading.tsx:27`: synchronous `setIsVisible(true)` in the effect's IntersectionObserver fallback.

The cause was effect-driven mount state used only to gate animation styles, plus synchronous state initialization in the unsupported-observer fallback. The fixes remove the redundant mount flags, apply Motion values directly, and schedule the fallback visibility update with `requestAnimationFrame`.

## Workflow steps in order

1. Install dependencies — `npm ci` (package script: none; npm command)
2. Check formatting — `npm run format:check` (script: `prettier --check .`)
3. Lint — `npm run lint` (script: `eslint .`)
4. Typecheck — `npm run typecheck` (script: `tsc --noEmit`)
5. Unit tests — `npm test` (script: `vitest run`)
6. Production build — `npm run build` (script: `next build`)
7. Install Playwright browser — `npx playwright install chromium` (not `--with-deps`)
8. Prepare Playwright environment — `cp .env.test.example .env.test`
9. End-to-end smoke tests — `npm run test:e2e` (script: `playwright test`)

Node is pinned at 22 in `setup-node`; `package.json` has no `engines` declaration and `.nvmrc` is absent. Node 22 satisfies the repository-provided minimum of 20.9+ in `AGENTS.md`.

## Changes

- `.github/workflows/ci.yml` — pinned runner to `ubuntu-24.04`; upgraded checkout/setup-node to v5; retained Node 22 and `npm ci`.
- `components/home/project-media.tsx` — removed effect-only mounted state and used Motion values directly.
- `components/layout/reading-progress.tsx` — removed effect-only mounted state and used the scroll value directly.
- `components/layout/reveal-heading.tsx` — removed mounted state and deferred fallback visibility update to an animation frame.
- `e2e/smoke.spec.ts` — scoped the invalid-password assertion to the actual error text to avoid matching Next's route announcer.
- `tests/e2e/admin.spec.ts` — scoped validation, conflict, and upload assertions to their app feedback instead of generic alert/status roles that also match Next's route announcer.
- `audit/ci-fix.md` — recorded reproduction, changes, and verification.

No visual design or site content was changed.

## Verification results

| Command                                         | Result                        | Notes                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci`                                        | PASS                          | Clean install completed; 429 packages installed.                                                                                                                                                                                                                                                                                                                                     |
| `npm run format:check`                          | PASS                          | After formatting the changed e2e files.                                                                                                                                                                                                                                                                                                                                              |
| `npm run lint`                                  | PASS                          | After the component fixes.                                                                                                                                                                                                                                                                                                                                                           |
| `npm run typecheck`                             | PASS                          | `tsc --noEmit` exited 0.                                                                                                                                                                                                                                                                                                                                                             |
| `npm test`                                      | PASS                          | 3 files, 8 tests passed.                                                                                                                                                                                                                                                                                                                                                             |
| `npx playwright install chromium`               | PASS                          | Browser install completed. Workflow uses this command without `--with-deps`.                                                                                                                                                                                                                                                                                                         |
| `cp .env.test.example .env.test`                | PASS                          | Prepared the local e2e environment.                                                                                                                                                                                                                                                                                                                                                  |
| `npm run test:e2e`                              | PARTIAL / environment failure | An initial run exposed ambiguous alert/status locators; after fixing them, tests 1–14 passed in a run whose tool session ended before a final summary. A subsequent captured run failed when its localhost test servers disappeared mid-run (`ECONNREFUSED` on `127.0.0.1:3020` and `127.0.0.1:4010`), followed by a Playwright trace artifact `ENOENT`. Full suite is not verified. |
| `npm run build`                                 | PASS                          | Production build completed successfully.                                                                                                                                                                                                                                                                                                                                             |
| `npx --yes actionlint .github/workflows/ci.yml` | PASS                          | Completed without diagnostics.                                                                                                                                                                                                                                                                                                                                                       |

The workflow runs the production build before browser installation and e2e; those steps were run in that order during the reproduction. Step 5 verification repeated `npm ci`, formatting, lint, typecheck, unit tests, and build successfully.
