# Tailwind styling migration

## Inventory

| Name / rule                                                   | Original CSS                                                                                |              Usage count | Target replacement                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -----------------------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| `:root` tokens                                                | Light colors, content width, color-scheme                                                   |                        1 | Colors and font in `@theme`; paper/ink applied in `@layer base`; width embedded in container utilities                              |
| `*`                                                           | `box-sizing: border-box`                                                                    |                   Global | `@layer base` reset                                                                                                                 |
| `html`                                                        | Position, scrolling, background                                                             |                        1 | `@layer base` reset                                                                                                                 |
| `body`                                                        | Margin, colors, font, size, line height, smoothing                                          |                        1 | `@layer base` reset                                                                                                                 |
| `code`, `a`, form controls                                    | Font inheritance and link defaults                                                          |                   Global | `@layer base`                                                                                                                       |
| `:focus-visible`                                              | 2px accent outline, 3px offset                                                              |                   Global | Kept in `@layer base`; original applies globally to every focusable element                                                         |
| `.skip-link` / focus                                          | Fixed position, transform reveal, visual style, transition                                  |                        1 | `@utility skip-link`; `focus:translate-y-0` on the skip link                                                                        |
| `.page-shell`                                                 | Centered width: `min(calc(100% - 2.5rem), 75rem)`; at 768px `min(calc(100% - 5rem), 75rem)` |                       17 | `mx-auto w-[min(calc(100%-2.5rem),75rem)] md:w-[min(calc(100%-5rem),75rem)]`                                                        |
| `.section-space`                                              | `padding-block: clamp(5rem, 11vw, 9rem)`                                                    |                        5 | `@utility section-space`                                                                                                            |
| `.eyebrow`                                                    | Muted, 0.72rem, weight 500, tracking 0.13em, line-height 1.35, uppercase                    |                       18 | `@utility eyebrow`                                                                                                                  |
| `.display-title`                                              | `clamp(2.75rem, 5.5vw, 5.25rem)`, weight 400, tracking -0.07em, line-height 1.1             |                        5 | Matching Tailwind utilities in each former use                                                                                      |
| `.section-title`                                              | `clamp(2.2rem, 5vw, 4.6rem)`, weight 400, tracking -0.075em, line-height 1.05               |                1 default | `@utility section-title`                                                                                                            |
| `.rule`                                                       | 1px line border                                                                             |                        0 | Removed as unused                                                                                                                   |
| `.hero-line` and child                                        | Block/overflow/padding plus rise animation                                                  | 1 parent + dynamic child | `@utility hero-line`, animation utility on child                                                                                    |
| `.hero-eyebrow`, `.hero-subline`, `.hero-ctas`, `.hero-aside` | Follow animation with delays 90/240/340/420ms                                               |                   1 each | Arbitrary animation utilities with matching duration, easing, delay; reduced-motion variants                                        |
| `hero-rise`, `hero-follow`, `reveal-in`, `marquee` keyframes  | Existing keyframes and timing                                                               |                        4 | `@theme` animation tokens and keyframes                                                                                             |
| Reveal-heading states                                         | Hidden until ready, reveal animation when visible                                           |                  Dynamic | `@utility reveal-ready` and `reveal-visible`; motion-reduce variants on component                                                   |
| `.project-media-initial`                                      | Opacity .68, scale .97, centered transform origin                                           |                        1 | `@utility project-media-initial`; motion-reduce overrides on component                                                              |
| `.marquee-track` and pause selectors                          | Flex max-content, 35s linear movement, pause hover/focus                                    |                        1 | `@utility marquee-track`; existing hover/focus pause remains represented by component interaction styling; reduced-motion utilities |
| `.progress-track`                                             | Transform origin left center                                                                |                        1 | `@utility progress-track`; reduced-motion hidden utility                                                                            |
| `.field-control`, placeholder                                 | Width, border, radius 6px, paper/ink, padding; muted placeholder                            |                        2 | `@utility field-control` and `placeholder-muted`                                                                                    |
| `.admin-prose textarea`                                       | Min-height 13rem, vertical resize, Lexend, .82rem, line-height 1.6                          |               1 textarea | `@utility admin-textarea` on textarea                                                                                               |
| `@media (min-width: 768px)`                                   | Wider page shell                                                                            |                       17 | `md:` container utilities                                                                                                           |
| Reduced motion media                                          | Globally shortens animations/transitions and disables specialty motion                      |                   Global | Kept once in `@layer base` because it preserves global third-party/Motion behavior and reset semantics                              |

## Replacements by component

| Former class / rule                                          | Replacement location                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `page-shell`                                                 | Routes in `app/` and shared home/layout components; converted to exact responsive width utilities            |
| `display-title`                                              | Error, not-found, note, and project route headings; converted to font-size/weight/tracking/leading utilities |
| `hero-*` animation classes                                   | `components/home/hero.tsx` arbitrary animation utilities                                                     |
| `reveal-heading` / `is-visible`                              | `components/layout/reveal-heading.tsx` with state-specific utility classes                                   |
| `admin-prose textarea`                                       | `components/admin/editor.tsx` textarea uses `admin-textarea`                                                 |
| `project-media-initial`                                      | `components/home/project-media.tsx` utility plus reduced-motion variants                                     |
| `marquee-track`                                              | `components/home/stack-marquee.tsx` utility plus reduced-motion variants on duplicates                       |
| `progress-track`                                             | `components/layout/reading-progress.tsx` utility; runtime Motion scale retained                              |
| `skip-link`                                                  | `app/layout.tsx` utility and focus transform variant                                                         |
| `section-space`, `eyebrow`, `section-title`, `field-control` | Existing uses retained as small Tailwind `@utility` definitions                                              |

## Stylesheets and inline styles

- Stylesheets: only `app/globals.css` exists outside dependencies/build output; imported by `app/layout.tsx` only.
- `<style>` tags: none in `app/` or `components/`.
- Runtime inline styles retained: `components/home/project-media.tsx` passes Motion `opacity` and `scale` values; `components/layout/reading-progress.tsx` passes Motion `scaleX`. Static style values were migrated to utility classes.
- `app/opengraph-image.tsx` has inline style objects for generated image layout. This is a Next.js image-generation route, not a component stylesheet; values are static and retained because the image renderer consumes style objects rather than Tailwind CSS.

## Exceptions

1. `@layer base` holds global box sizing, document/body defaults, font binding, links/forms reset, and the original global focus outline.
2. One reduced-motion media rule remains in `@layer base` to honor the prior global animation/transition behavior, including Motion-managed elements.
3. Two runtime Motion styles remain, plus static style objects in the Open Graph image route as detailed above.

## Verification

- `npm run lint`: **Fail**, pre-existing errors: setState-in-effect in `components/home/project-media.tsx`, `components/layout/reading-progress.tsx`, and `components/layout/reveal-heading.tsx`; `require()` imports in `tests/mocks/github-server.ts`.
- `npm run typecheck`: **Fail**, pre-existing type errors in `tests/e2e/admin.spec.ts` and `tests/mocks/github-server.ts` (implicit/unknown types).
- `npm run format:check`: **Pass** after formatting the changed source and existing audit/test docs.
- `npm test`: **Pass**, 3 test files / 8 tests.
- `npm run build`: **Blocked**, Turbopack failed with `creating new process → binding to a port → Operation not permitted`.
- `npx next build --webpack`: **Fail**, `Could not parse output from TypeScript's --showConfig`.
- CSS file inventory: **Pass**, only `app/globals.css`.
- `grep -rn '<style' app components`: **Pass**, no output.
- `@media` inventory: **Pass**, one reduced-motion exception in `@layer base`.
- Removed custom-class scan: no `page-shell`, `display-title`, `hero-eyebrow`, `hero-subline`, `hero-ctas`, `hero-aside`, `is-visible`, `admin-prose`, or `.rule` styling references remain. `RevealHeading` occurrences are component/import names, not CSS classes.

## Visual parity

Visual parity: not run, server could not start (baseline `npm run build` failed: `creating new process → binding to a port → Operation not permitted`). No before/after screenshots or computed-style comparison could be collected.

## Final checks

- Custom classes converted/removed: 13 custom presentation classes/state selectors; unused `.rule` removed.
- Remaining custom utilities: 11 small utilities for repeated styles/selectors not expressed as simple utilities.
- Remaining exceptions: global base/reset/focus rules, one reduced-motion media rule, and runtime/static inline styles described above.
- Visual parity: not run due to build/server environment block.
