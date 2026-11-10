# Portfolio implementation audit

**Verdict: Implemented with fixes.** Seven corrective items were made during this audit. The application features are present and the npm migration is reflected in the project files. Static repository scans pass. A clean npm install and runtime verification could not complete because the package registry is unreachable in this environment; see the command log below. No commit, push, or branch creation was performed.

## 1. Full spec checklist

Status meanings: **PASS** means the implementation is present and supported by source evidence; **PARTIAL** means present but could not be fully verified here or has an environment limitation; **FAIL** means the requested check did not pass.

### Stack

| Status | Requirement | Evidence |
|---|---|---|
| PASS | Next.js App Router and strict TypeScript | `app/` routes; `tsconfig.json` has `strict: true`; `package.json` pins Next.js 16.4.5, shown as the npm `latest` tag at audit time ([npm package versions](https://www.npmjs.com/package/next?activeTab=versions)). |
| PASS | Tailwind, used shadcn-style components, and Lucide | Tailwind/PostCSS config; `components/ui/button.tsx` and `components/ui/accordion.tsx` are used; Lucide imports appear in page components. |
| PASS | Lexend is the only declared typeface, loaded with `next/font/google` as a variable font | `app/layout.tsx`; `app/globals.css` declares only `var(--font-lexend)` as a family. |
| PASS | Lenis, Motion, Zod, Jose, Vitest, Playwright | `package.json`; `components/layout/smooth-scroll.tsx`, `components/home/project-media.tsx`, `src/lib/content/schema.ts`, `src/lib/auth/session.ts`, `tests/`, and `e2e/`. |

### Design system

| Status | Requirement | Evidence |
|---|---|---|
| PASS | CSS-variable palette anchored by paper, ink, muted, and accent | `app/globals.css`; remaining `line` and `wash` colors are low-contrast surface/border tokens in the same neutral palette; dark values are ink-based. |
| PASS | Color-token scan | `rg` scan of `app`, `components`, `content`, `public`, and `next.config.ts` returned no disallowed color or visual-effect matches. All listed hex colors are the declared light/dark palette tokens. |
| PASS | No emoji icons, lorem ipsum, or stock people illustrations | Source/content scan returned no matches; assets are custom interface sketches and a monogram in `public/`. |
| PASS | Mobile-first responsive layouts | Main sections use the fluid `.page-shell`, base mobile layout classes, and `md:` breakpoints; `e2e/smoke.spec.ts` covers 360, 768, 1280, and 1920 CSS-pixel widths. Runtime viewport checks remain unexecuted here. |

### Scroll and motion

| Status | Requirement | Evidence |
|---|---|---|
| PASS | Root Lenis, disabled for reduced motion | `app/layout.tsx`; `components/layout/smooth-scroll.tsx` observes `prefers-reduced-motion`. |
| PASS | Staggered, masked hero line reveal | `components/home/hero.tsx`; `app/globals.css` hero keyframes and delays. |
| PASS | Sticky selected work with scroll-linked media | `components/home/selected-work.tsx`; `components/home/project-media.tsx` uses Motion scroll values for opacity and scale. |
| PASS | Reading progress | `components/layout/reading-progress.tsx`. |
| PASS | Once-only in-view section heading reveals | `components/layout/reveal-heading.tsx` calls `useInView(..., { once: true })`. |
| PASS | Marquee pauses on hover/focus and becomes static for reduced motion | `components/home/stack-marquee.tsx`; `app/globals.css`. |
| PASS | No custom cursor | No custom cursor implementation found. |
| PASS | Motion uses transform/opacity | CSS animations affect opacity/transform; Motion media effects use opacity/scale; accordion arrow and skip-link transitions use transform. |

### Content model

| Status | Requirement | Evidence |
|---|---|---|
| PASS | `content/site.json` parsed and validated by Zod | `src/lib/content/load.ts`; `src/lib/content/schema.ts`. |
| PASS | Image alt text required | `imageSchema` requires non-empty `alt`; tests cover missing alt text. |
| PASS | Placeholder content marked at the top | First property of `content/site.json` is `_comment`, which labels the sample content and demo metrics as placeholders while keeping the file valid JSON. |
| PASS | Clinic Queue Manager and Social Media Agent examples | `content/site.json` includes both, with C++/data-structure and Gemini API details respectively. |

### Pages and routes

| Status | Requirement | Evidence |
|---|---|---|
| PASS | Home sections: hero, selected work, approach, experience, services, availability, contact | `app/page.tsx`; `components/home/`; `components/home/services-contact.tsx`. |
| PASS | Static project case studies and previous/next links | `app/work/[slug]/page.tsx` defines `generateStaticParams` and adjacent-project navigation. |
| PASS | Notes available only when notes exist | Notes exist in shipped content. `app/notes/page.tsx` calls `notFound()` if empty; detail params and sitemap are content-driven; navigation hides the link when empty. |
| PASS | Admin login and editor features | `app/admin/login/page.tsx`, `app/admin/page.tsx`, `components/admin/editor.tsx`; RHF/Zod, section accordions, dirty navigation warning, save status, preview link. |
| PASS | Custom not-found and error pages | `app/not-found.tsx`, `app/not-found-view/page.tsx`, `app/error.tsx`, and `app/error/page.tsx`. |
| PASS | Robots, sitemap, metadata, generated social image | `app/robots.ts`, `app/sitemap.ts`, route metadata, and `app/opengraph-image.tsx`. |

### Admin architecture

| Status | Requirement | Evidence |
|---|---|---|
| PASS | Password login, Jose token, Secure/HTTP-only/Strict cookie, eight-hour expiry | `app/api/admin/login/route.ts`; `src/lib/auth/session.ts`; cookie has `secure`, `httpOnly`, and `sameSite: "strict"`; token expiry is eight hours. |
| PASS | Guard for admin pages and APIs | `proxy.ts` matcher covers `/admin/:path*` and `/api/admin/:path*`, allowing login entry points. This is the Next.js 16 request-guard convention. |
| PASS | In-memory login limit and generic error | `src/lib/admin/rate-limit.ts`; `app/api/admin/login/route.ts`. |
| PASS | Zod-validated GitHub content save with SHA and conflict response | `app/api/admin/content/route.ts`; `src/lib/github/contents.ts` compares the editor baseline with current GitHub content and updates using its SHA; stale changes map to HTTP 409. Unit tests cover stale and update-time conflicts. |
| PASS | Two-megabyte JPEG/PNG/WebP upload, signature validation, GitHub commit | `app/api/admin/upload/route.ts`; `commitUploadToGitHub` in `src/lib/github/contents.ts`. |
| PASS | No client GitHub token and no route filesystem writes | GitHub helper is server-only; admin routes call Contents API and contain no filesystem writes. |
| PASS | Example environment variables without real secrets | `.env.example`; example token is a descriptive replacement string. Workflow contains no sample credentials. |

### Accessibility

| Status | Requirement | Evidence |
|---|---|---|
| PASS | Skip link, main landmarks, one page-level h1, visible focus | `app/layout.tsx`, route/component `main` and `h1` elements; `components/layout/reveal-heading.tsx` supports an h1 for the Notes index; `:focus-visible` in `app/globals.css`. |
| PASS | `next/image`, dimensions, and responsive sizes | `components/home/hero.tsx`, `components/home/project-media.tsx`, and `app/work/[slug]/page.tsx`; each image has width/height and `sizes`. |
| PASS | System color scheme respected | `app/globals.css` has a deliberate ink-based dark palette; `app/layout.tsx` sets `colorScheme` and theme colors. |
| PARTIAL | Lighthouse target of 95+ | Lighthouse could not be run because dependency installation and browser setup were blocked; no score is claimed. |

### Tooling and DevOps

| Status | Requirement | Evidence |
|---|---|---|
| PASS | npm scripts, ESLint, Prettier | `package.json`, `eslint.config.mjs`, `.prettierrc.json`; npm scripts include lint, typecheck, format:check, test, test:e2e, and build. |
| PARTIAL | Vitest coverage and execution | `tests/content.test.ts`, `tests/auth.test.ts`, and `tests/github-contents.test.ts` cover schema/alt, slug, auth token, and mocked GitHub save behavior. Current run was blocked after clean install could not fetch dependencies. An earlier run before the npm migration passed 8 tests. |
| PARTIAL | Playwright smoke coverage and execution | `e2e/smoke.spec.ts` contains the six requested browser flows. Current run could not start because dependencies were absent after the failed clean install; an earlier server attempt was also denied localhost binding. |
| PASS | Pull-request CI uses npm and runs required gates | `.github/workflows/ci.yml` uses `npm ci`, npm scripts, and `npx playwright install chromium`. |
| PASS | Security headers | `next.config.ts` configures CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, and strict-origin referrer policy. |
| PASS | README covers setup, env, token, Vercel, save flow, placeholders, decisions; commands use npm | `README.md`. |

## 2. Verification commands

Commands were attempted in the requested order. The initial `npm install` completed and generated the npm lockfile. The environment then lost access to `registry.npmjs.org`; the clean install removed `node_modules`, so dependent commands could not find their executables.

| # | Command | Result |
|---|---|---|
| 1 | `npm install` | **PASS** - added 7 packages, removed 5, changed 6, audited 430 packages; npm reported 10 moderate advisories. The generated lockfile was retained. `npm ci` was then attempted repeatedly from the clean tree and **FAILED**: registry DNS returned `EAI_AGAIN`/`ENOTCACHED`; the final attempt also reported npm “Exit handler never called.” Offline retries confirmed required package metadata was not cached. |
| 2 | `npm run lint` | **FAIL / environment** - exit 127, `eslint: command not found` because clean installation could not complete. |
| 3 | `npm run typecheck` | **FAIL / environment** - exit 127, `tsc: command not found` for the same reason. |
| 4 | `npm run format:check` | **FAIL / environment** - exit 127, `prettier: command not found` for the same reason. |
| 5 | `npm test` | **FAIL / environment** - exit 127, `vitest: command not found` for the same reason. Earlier pre-migration run passed 8 tests. |
| 6 | `npx playwright install chromium` | **FAIL / environment** - Playwright attempted Ubuntu dependency installation, but `sudo` was blocked by the container’s “no new privileges” restriction. |
| 7 | `npm run test:e2e` | **FAIL / environment** - exit 1, Playwright config could not import `@next/env` because project dependencies were absent after the failed clean install. Earlier, starting Next directly was denied with `listen EPERM` on localhost. |
| 8 | `npm run build` | **FAIL / environment** - exit 127, `next: command not found` after the failed clean install. An earlier build with dependencies present stopped while fetching Lexend from Google Fonts. |

The requested final rerun has the same environment blocker: `npm ci` cannot resolve/download uncached package metadata without registry access. It would leave every subsequent npm script without local executables; those outcomes are captured above rather than presented as source failures.

## 3. Changes made

| File | Change and reason |
|---|---|
| `package.json` | Removed the old package-manager pin, added `@next/env` to load local Playwright credentials, kept the required npm scripts. |
| `package-lock.json` | Generated by `npm install`; updated the root dev dependency entry for `@next/env`. It is the repository’s only lockfile. |
| Previous package-manager lockfile | Removed so npm is the only supported installer in the repository. |
| `.github/workflows/ci.yml` | Replaced package setup/install and scripts with Node’s npm cache, `npm ci`, npm scripts, and the requested Playwright `npx` command; CI copies `.env.test.example` for browser credentials and no longer stores sample credentials in workflow env. |
| `playwright.config.ts` | Starts the server through npm and loads credentials from `.env.local` rather than embedding a test password. |
| `e2e/smoke.spec.ts` | Requires the configured test password instead of embedding a literal. |
| `README.md`, `AGENTS.md` | Migrated all setup and verification commands to npm; clarified Playwright env loading. |
| `.prettierignore` | Ignores `package-lock.json` rather than the removed lockfile. |
| `.gitignore` | Explicitly ignores local env files and QA output. |
| `.env.example` | Replaced the token-shaped placeholder with descriptive non-secret text. |
| `components/home/hero.tsx` | Added responsive `sizes` to the profile image. |
| `components/layout/reveal-heading.tsx`, `app/notes/page.tsx` | Made reveal headings support h1/h2 and corrected the Notes index to have its required h1. |
| `app/globals.css` | Removed generic fallback family declarations and explicitly keeps code UI in Lexend. |
| `audit/execution-report.md` | Added this evidence-based audit and verification record. |

No lint, typecheck, or test suppression was added.

## 4. Hard checks

| Status | Check | Evidence |
|---|---|---|
| PASS | No real secret or token-shaped values outside `.env.example` | Secret-pattern scan excluding `.env.example` returned no matches. CI no longer embeds test env values. |
| PASS | `.gitignore` covers local env, dependencies, build, Playwright, and QA outputs | `.gitignore` includes `.env`, `.env*.local`, `node_modules/`, `.next/`, `playwright-report/`, `test-results/`, and `qa/`. |
| PASS | No alternate package-manager references or lockfiles | Repository text scan returned no matches; only `package-lock.json` exists. Package and lockfile dependency versions match; lockfile version is 3 and no package-manager pin remains. |
| PASS | Color-token scan | Scan of application, components, content, assets, and Next config returned no disallowed color or visual-effect matches. |
| PARTIAL | Logged-out admin redirect | `proxy.ts` statically redirects `/admin/*` to `/admin/login`; live request verification could not run because the app server could not start. |
| FAIL | Production build and first-load JS size for home and work case study | The clean install could not complete; build and bundle analysis could not run. Earlier build stopped at the Google Fonts fetch. |

## 5. Decisions

- The editor remains a collapsible JSON form per content section to handle nested arrays while validating each section and the full document.
- The placeholder marker is a `_comment` JSON field so the content remains valid JSON.
- The app uses the Next.js 16 `proxy.ts` request guard convention.
- Login throttling is process-local, matching the small no-database requirement; serverless instances do not share limiter state.
- Notes routes are present because the shipped content includes a note; if notes are removed, navigation and sitemap entries disappear and the pages return not found.
- A generated profile-based Open Graph image and custom SVG interface sketches avoid stock illustrations.
- The site follows the operating system’s color preference with a deliberate dark palette.

## 6. Remaining manual steps

1. Run `npm ci` on a machine with access to the npm registry, then run the full verification sequence below. This will also establish whether the generated lockfile reproduces cleanly.
2. Run `npx playwright install chromium` in a host where Playwright can install browser dependencies, then run E2E tests.
3. Ensure the production build environment can fetch Lexend through Google Fonts, or arrange network access for `next/font/google` builds.
4. Replace placeholder profile, project, link, experience, note, and metric content; replace the monogram and project SVGs with real images and descriptive alt text.
5. Create a repository-scoped GitHub fine-grained token and set the required environment variables in Vercel.
6. Check the 10 moderate npm advisories with `npm audit` once registry access is available; the registry was unavailable for remediation during this audit.

After installing dependencies, local commands are:

```sh
npm install
cp .env.example .env.local
npm run dev
```

## 7. Follow-up: hydration, mock admin, launch, and browser QA (2026-11-10)

**Updated overall status: Not fully verified; do not treat the earlier implementation audit as a clean runtime sign-off.** This follow-up records the requested fixes and blockers after npm-only verification.

### Part A: console issues and changes

| Original message | Cause addressed | Files changed | Verification |
|---|---|---|---|
| Hydration mismatch on `RevealHeading` (`is-visible` differs) | Viewport visibility was formerly allowed into render output. The heading now starts with matching server/first-client classes and only observes visibility in an effect; it observes once and has an unsupported-browser fallback. | `components/layout/reveal-heading.tsx` | Source fix present; browser console comparison not executed because `next` is unavailable and localhost binds are denied. Regression test added at `tests/e2e/console.spec.ts`. |
| Hydration mismatch on `ProjectMedia` inline opacity/scale | Scroll-derived styles now apply only after mount; initial opacity/scale are shared CSS, and reduced motion sets the final state in CSS. | `components/home/project-media.tsx`, `app/globals.css` | Source fix present; runtime console check blocked. |
| Same heading mismatch in Approach, Experience, Services | Shared `RevealHeading` fix addresses all instances. | `components/layout/reveal-heading.tsx` | Regression test expects four visible headings under reduced motion; test could not run due listener restriction. |
| Motion “non-static position” warning | `ProjectMedia` scroll target is now `relative`; `ReadingProgress` uses root scroll with no target/container. | `components/home/project-media.tsx`, `components/layout/reading-progress.tsx` | Static inspection shows no other `useScroll` target/container. Runtime warning check blocked. |
| Motion reduced-motion informational message | Not suppressed globally. Added browser test asserting visible headings/media and static marquee under reduced motion. | `tests/e2e/console.spec.ts`, `app/globals.css` | Not run; no browser app could start. |

The server-rendered component scan found `window.matchMedia` in `components/layout/smooth-scroll.tsx`, called only inside `useEffect`; date usage occurs in server-side notes rendering, the contact component, and auth/rate limiting. No `typeof window`, `localStorage`, or `Math.random` render branch was found in `app/`, `components/`, or `src/`.

### Part B1: npm install and verification sequence

Three clean install attempts were made (initial plus two retries, each retry after 30 seconds). The exact persistent network failure was `getaddrinfo EAI_AGAIN registry.npmjs.org`; npm also emitted `Exit handler never called!`. `npm config get registry` is `https://registry.npmjs.org/`, proxy settings are null, project `.npmrc` is absent, and no proxy or registry environment variables were configured. Therefore a successful `npm ci` is **not** claimed. The failed clean install left local command binaries unavailable.

| # | Command | Result and output summary |
|---|---|---|
| 1 | `rm -rf node_modules && npm ci` | **FAIL (3 attempts)** - registry DNS `EAI_AGAIN registry.npmjs.org`; npm internal `Exit handler never called!`; no clean install completed. |
| 2 | `npm run lint` | **FAIL, 0 lint checks** - exit 127, `eslint: command not found`. |
| 3 | `npm run typecheck` | **FAIL, 0 type checks** - exit 127, `tsc: command not found`. |
| 4 | `npm run format:check` | **FAIL, 0 files checked** - exit 127, `prettier: command not found`. |
| 5 | `npm test` | **FAIL, 0 unit tests** - exit 127, `vitest: command not found`. |
| 6 | `npm run test:e2e` | **FAIL, 0 browser tests** - with test env copied, the mock server failed to bind: `listen EPERM: operation not permitted 127.0.0.1:4010`. Before copying test env, config correctly requested `.env.test`. |
| 7 | `npm run build` | **FAIL, 0 build routes** - exit 127, `next: command not found`. |

The required full rerun could not pass until npm registry and loopback server access are available. `npm run dev` likewise reports `next: command not found`, so it does not open in Chrome: Next.js was removed during the required clean install and npm could not download it again. Chrome itself is installed (`Google Chrome 155.0.8059.84`); the app server is the blocker.

### Part B2/B3: browser QA, Playwright, Lighthouse

QA target resolution selected `http://localhost:3000` because `QA_BASE_URL` and a deployed URL in docs were not set. `npm run build && npm run start` stopped at `next: command not found`. Consequently no routes could be rendered and no screenshots were captured; `qa/screenshots/` remains empty and `qa/report.md` lists the exact blockers. The QA report does not claim visual findings without screenshot or measurement evidence.

`npx playwright install chromium` was attempted without `--with-deps` but hung without output while resolving/downloading; it was interrupted. A system Chrome binary is present and `playwright.config.ts` supports `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/google-chrome`. Existing Playwright Chromium cache directories are present. Neither browser option can provide route checks without a running site and permitted local listeners. Lighthouse is absent from the dependency cache; npm registry access prevented installing it. No Lighthouse scores, vitals, or JS bundle sizes are claimed.

### Part B4: mock admin implementation

| Status | Requirement | Evidence |
|---|---|---|
| PARTIAL | Configurable GitHub API root | `src/lib/github/contents.ts` reads `GITHUB_API_URL`, default `https://api.github.com`. |
| PARTIAL | In-memory Contents API mock with SHA conflict and commit recording | `tests/mocks/github-server.ts`; smoke startup was attempted but the sandbox rejected binding on port 4010. |
| PARTIAL | Admin browser flows for redirect, six wrong passwords, cookie attributes, dirty warning, field validation, save, conflict, valid/invalid upload, logout | Added `tests/e2e/admin.spec.ts`; not executed due mock listener `EPERM`. |
| PARTIAL | Test-only env and Playwright mock server setup | `.env.test.example`, `.gitignore`, `playwright.config.ts`; local ignored `.env.test` copied from the example. |
| PASS | Manual deployed admin checks documented | `README.md`, `docs/launch-checklist.md`. |

Live deployment checks remain: login, cookie flags on deployed HTTPS, save/commit, conflict, successful image upload and invalid-file rejection, logout, and public content after redeployment.

### Part B5: npm audit

`npm audit --json` failed before returning advisories: `request to https://registry.npmjs.org/-/npm/v1/security/audits/quick failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org`. `npm audit --offline --json` reported zero only from local cache, so it is explicitly not treated as a clean audit. Earlier audit output recorded a total of 10 moderate advisories but did not preserve package-level details; no safe package-level remediation or dismissal can be made from that count. See `qa/audit-notes.md`; re-run audit when registry access is restored. No `npm audit fix --force` was used.

### Part B6: launch preparation

- Added `scripts/check-launch.mjs`, `npm run check:launch`, and `docs/launch-checklist.md`.
- Added `GITHUB_API_URL` to `.env.example` and `.env.test.example`.
- Updated CI to install Chromium without sudo and use `.env.test.example`.
- `npm run check:launch` **FAIL (expected)**: missing production vars `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`; placeholder markers found in `content/site.json` and `public/avatar-mark.svg`.

### Changes in this follow-up

| File | Change and reason |
|---|---|
| `components/layout/reveal-heading.tsx` | Defer intersection visibility until effect to keep hydration markup identical and reveal once. |
| `components/home/project-media.tsx` | Move initial visual values to class and apply scroll motion after mount; position the scroll target. |
| `components/layout/reading-progress.tsx` | Defer scroll-linked inline style until mount. |
| `app/globals.css` | Shared initial media state and reduced-motion final/static states. |
| `src/lib/github/contents.ts` | Support configurable mock/production GitHub API root. |
| `tests/e2e/console.spec.ts` | Add hydration/position console regression and reduced-motion visibility checks. |
| `tests/mocks/github-server.ts` | Add in-memory Contents API, commit log, reset, and conflict controls. |
| `tests/e2e/admin.spec.ts` | Add requested mock-backed admin flows. |
| `playwright.config.ts` | Load `.env.test`, start mock plus app, select dev/prod server, and support system Chrome path. |
| `.env.test.example`, `.env.example`, `.gitignore` | Document test-only values, GitHub API endpoint, and ignore local test env. |
| `.github/workflows/ci.yml` | Use `npm ci`, browser install without sudo, and test-only env file. |
| `scripts/check-launch.mjs`, `package.json`, `docs/launch-checklist.md` | Detect placeholders and missing production env; document launch preparation. |
| `README.md` | Document mock tests and required live admin verification. |
| `qa/report.md`, `qa/audit-notes.md` | Record evidence-based QA limitations and npm audit network failure. |

### Remaining actions

1. Restore npm registry access and rerun `npm ci`, then the full verification sequence in the order requested.
2. Run Playwright on a host where loopback listeners are permitted; use the cached Chromium or `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/google-chrome`.
3. Run the full QA plan and Lighthouse once the site can be served; capture screenshots under `qa/screenshots/`.
4. Re-run `npm audit --json` with network access and record the exact advisory table.
5. Replace placeholder content/images, create the scoped GitHub token, set Vercel environment variables, deploy, and verify the live admin flows.

No changes were committed, pushed, or placed on a new branch.


### Follow-up: Motion scroll-container warning

The warning came from Motion pairing the `ProjectMedia` target with the default document scroll container. The media target was already positioned, but the document root (`html`) remained `position: static`, which Motion checks for target-based scroll offsets. Set `html { position: relative; }` in `app/globals.css`; this preserves root-page scrolling and makes the default container positioned. The app cannot be launched here (`next: command not found` after registry-blocked `npm ci`), so browser confirmation remains pending.
