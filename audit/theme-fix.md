# Light theme fix

## Files changed

- `app/globals.css`: removed the `prefers-color-scheme: dark` token override; retained existing light tokens.
- `app/layout.tsx`: pinned viewport color scheme to light and theme color to `#F6F3EE`.
- `tests/e2e/theme.spec.ts`: added Playwright assertion for light and dark browser contexts.
- Pre-existing uncommitted changes remain in `app/globals.css` (display-title styles) and `components/home/services-contact.tsx`.

## Light palette retained

- paper: `#f6f3ee`
- ink: `#1b1a17`
- muted: `#716d65`
- accent: `#b4532a`
- line: `#dcd7ce`
- wash: `#eeebe5`

## Verification

- `npm run lint`: FAIL, existing lint errors in project-media, reading-progress, reveal-heading, and tests/mocks/github-server.ts.
- `npm run typecheck`: FAIL, existing type errors in tests/e2e/admin.spec.ts and tests/mocks/github-server.ts.
- `npm run build`: FAIL at TypeScript validation with the same existing errors; compilation succeeded.
- `npm test`: PASS (3 files, 8 tests).
- `npm run test:e2e -- --grep 'light theme is used'`: BLOCKED, configured test server could not bind `127.0.0.1:4010` (`listen EPERM`).
- Browser screenshot: not produced because browser test server could not start.

## Grep

Searched outside `node_modules` and `.next` for `prefers-color-scheme|dark:|darkMode|color-scheme: dark|matchMedia`.

- Theme-specific matches removed from app theme and layout.
- Remaining matches: `components/layout/smooth-scroll.tsx:8` uses `matchMedia` only for reduced-motion preference; `audit/execution-report.md:182` mentions `matchMedia` in audit prose. No dark theme selector or dark color-scheme declaration remains.
