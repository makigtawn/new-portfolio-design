# Meklit Girmaw — Fullstack Developer

A responsive, editorial portfolio built with the Next.js App Router. Project and profile content lives in `content/site.json`, is validated with Zod during page generation, and is editable through the protected admin area.

The shipped identity, links, timelines, and outcomes are placeholders. Replace them before publishing. Project metrics are explicitly unverified placeholders and should only be replaced with measured results.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Replace the example admin password from `.env.example` before using the editor beyond local development. Generate a session secret with:

```sh
openssl rand -base64 32
```

Install dependencies with `npm ci` after the lockfile is available. The full checks are:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm run test:e2e` starts a local Next.js server on port 3020 unless `PORT` or `PLAYWRIGHT_BASE_URL` is set. Playwright reads its test credentials from `.env.test`; create that file from `.env.test.example` before running the browser suite.

## Environment variables

| Variable               | Required                 | Purpose                                                                     |
| ---------------------- | ------------------------ | --------------------------------------------------------------------------- |
| `ADMIN_PASSWORD`       | Yes                      | The single password used to sign in to `/admin`.                            |
| `ADMIN_SESSION_SECRET` | Yes                      | At least 32 characters; signs the eight-hour admin session cookie.          |
| `GITHUB_TOKEN`         | Yes for saving/uploading | Fine-grained token used only by server routes to commit content and images. |
| `GITHUB_REPO`          | Yes for saving/uploading | Repository in `owner/name` format.                                          |
| `GITHUB_BRANCH`        | Yes for saving/uploading | Branch updated by the editor.                                               |
| `GITHUB_API_URL`       | No                       | GitHub Contents API root; defaults to `https://api.github.com` (tests use a local mock). |
| `NEXT_PUBLIC_SITE_URL` | Recommended              | Canonical public origin used by metadata, robots, and sitemap.              |

The admin can be opened without GitHub variables, but content saves and image uploads return a configuration error until all three GitHub variables are set. GitHub credentials are read only on the server and are never sent to browser code.

## Configure a GitHub fine-grained token

1. In GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens** and create a token limited to the portfolio repository.
2. Set repository access to only the repository in `GITHUB_REPO`.
3. Grant **Contents: Read and write**. Keep other repository permissions off.
4. Copy the token into `GITHUB_TOKEN` in your local `.env.local` and your Vercel project’s environment variables. Never place it in `content/site.json` or a `NEXT_PUBLIC_*` variable.
5. Set `GITHUB_BRANCH` to the branch the editor should update. The token needs permission to update it; branch protection rules may need to allow this direct contents commit.

## Admin save and upload flow

`/admin/login` checks the submitted password on the server and issues a `Secure`, HTTP-only, `SameSite=Strict` session cookie signed with `ADMIN_SESSION_SECRET`. The cookie expires after eight hours. The Next.js 16 Proxy request guard protects `/admin/*` and `/api/admin/*`, except the login entry points. Login failures use one generic message and an in-memory per-process limiter (five attempts per 15 minutes).

The editor presents a collapsible, Zod-validated JSON form for each content section. Save validates the combined content, compares the editor’s starting content with the current `content/site.json` on the configured GitHub branch, then sends a Contents API update with the current file SHA. If another editor already saved, the route returns HTTP 409 instead of replacing that newer content. The SHA also protects the short interval between the comparison and the update. A successful save creates a commit, after which the connected Vercel deployment rebuilds the public site.

Image upload accepts JPEG, PNG, and WebP up to 2 MB, checks file signatures as well as MIME type, and commits a uniquely named file under `public/uploads/` through the GitHub Contents API. The route does not write to the local filesystem. Copy the returned path into the matching image `src` field and provide useful alt text.

## Deploy to Vercel

1. Push the project to a GitHub repository and import it in Vercel. Use the default Next.js build settings.
2. Add `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `NEXT_PUBLIC_SITE_URL` to the Vercel project. Use distinct, strong production secrets.
3. Ensure Vercel watches the branch configured in `GITHUB_BRANCH`; editor commits should trigger a new deployment.
4. Deploy, then open `/admin/login` and replace the sample site content.

Next.js downloads the Lexend variable font during `next/font/google` builds, so the build environment must be able to reach Google Fonts.

## Replace placeholder content

Edit `content/site.json` or use `/admin` after configuring the GitHub variables. Its first `_comment` field marks the included details as placeholders while keeping the file valid JSON. Keep required fields, unique project slugs, valid links, and non-empty image alt text. The clinic queue and social agent metric strings are prompts for future verified measurements, not claims about shipped results.

Notes are optional. When `notes` is missing or empty, the Notes navigation entry is hidden and the notes pages return not found. The `opengraph-image.tsx` route creates a profile-based social image; update its layout if the profile’s name or proof point needs a different fit.

## Decisions

- The admin uses one collapsible JSON editor per top-level content section. This keeps arrays and nested project records editable without a database or a fragile collection of partially synchronized fields; each section and the full document validate before save.
- Playwright reads admin test credentials from `.env.local`; CI creates that ignored file from `.env.example` so credentials are not duplicated in workflow configuration.
- Route protection uses the Next.js 16 `proxy.ts` convention, the current replacement for `middleware.ts`, so the app avoids the deprecated middleware file convention while guarding the same paths.
- The placeholder notice is stored as a top-level `_comment` field because strict JSON does not support source comments. This keeps the file importable by Next.js Edge-generated Open Graph images.
- Rate limiting uses in-memory state because the requested backend is intentionally small. On serverless deployments, state is per warm instance and is not a distributed rate limiter.
- Notes routes are included because the sample content contains one note. If notes are removed, the navigation entry is hidden and both note index and detail requests resolve to not found.
- `/not-found` rewrites to a small public not-found page while the standard App Router not-found boundary remains available for unknown routes.
- Case study cover art is a small custom SVG interface sketch rather than stock imagery. Replace it with project screenshots through the upload control when available.

## Automated and deployed admin verification

Copy `.env.test.example` to `.env.test` before running Playwright. The test runner starts a local in-memory GitHub Contents API mock on port 4010 and the app on port 3020; it exercises login, rate limiting, cookie flags, dirty navigation, validation, save/conflict behavior, uploads, and logout. `GITHUB_API_URL` selects the GitHub API endpoint and defaults to `https://api.github.com` outside tests.

The mock suite does not replace a deployment check. After deployment, manually verify the admin login, content save, image upload, stale-SHA conflict response, logout, and that a saved public change appears after redeployment. See [docs/launch-checklist.md](docs/launch-checklist.md). Run `npm run check:launch` before launch; it intentionally fails while placeholder content/assets remain or production environment variables are missing.
