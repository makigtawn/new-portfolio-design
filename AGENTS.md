# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router portfolio using TypeScript, React, and Tailwind CSS. Route files and shared styles live in `app/`; reusable page sections and layout/UI components live in `components/`. Server-side helpers are grouped under `src/lib/` (content validation/loading, authentication, GitHub integration, and URL handling). Portfolio data is in `content/site.json`, static assets in `public/`, unit tests in `tests/`, and browser smoke tests in `e2e/`. Keep route-specific behavior in its route and extract shared behavior to components or library modules.

## Build, Test, and Development Commands

Use npm with Node.js 20.9 or newer:

- `npm install` installs dependencies.
- `npm run dev` runs the local development server at port 3000.
- `npm run build` creates a production build; `npm start` serves it.
- `npm run lint` runs ESLint; `npm run typecheck` runs TypeScript without emitting files.
- `npm test` runs the Vitest unit suite; `npm run test:watch` runs it interactively.
- `npm run test:e2e` runs Playwright smoke tests (server defaults to port 3020).
- `npm run format:check` checks Prettier formatting; `npm run format` applies it.

## Coding Style & Naming Conventions

Use TypeScript and follow the repository's Prettier configuration (two-space indentation, semicolons, double quotes). Components use PascalCase filenames or descriptive kebab-case where already established; hooks and utilities use descriptive lower-case names. Keep components focused, use Zod schemas for external/content validation, and avoid weakening types with `any`. Tailwind classes are formatted by the configured Prettier plugin.

## Testing Guidelines

Add Vitest cases in `tests/` with names ending in `.test.ts`; cover content parsing, auth, and helper behavior when changed. Add user-facing browser flows to `e2e/` as Playwright specs ending in `.spec.ts`. Run the relevant suite plus lint and typecheck before submitting; no coverage threshold is configured.

## Commit & Pull Request Guidelines

The repository has no existing Git commit history to infer a commit convention. Use concise imperative commit subjects (for example, `Add project case study page`). Pull requests should explain the user-visible change, note configuration or environment changes, link related issues when available, and include screenshots for visual changes.
