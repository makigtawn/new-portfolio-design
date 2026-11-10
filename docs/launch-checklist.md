# Launch checklist

- Replace the sample profile name, role, proof point, biography, location, availability, and hero copy.
- Replace both sample projects with accurate project descriptions, stacks, dates, problem/approach/outcome details, and measured metrics. Remove or rewrite placeholder notes.
- Replace example links, email addresses, social URLs, experience, services, and optional notes with real information.
- Replace placeholder cover art with real project screenshots or a real profile photo. Do not use stock illustrations of a person. Supply meaningful alt text.
- Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `NEXT_PUBLIC_SITE_URL` in Vercel. Generate `ADMIN_SESSION_SECRET` as a random value of at least 32 bytes (for example, `openssl rand -base64 32`).
- Create a GitHub fine-grained token scoped only to this repository with Contents read and write permission.
- After deployment, manually verify admin login, content save, image upload, stale-SHA conflict handling, and logout. Also verify the public site reflects a saved change after its deployment completes.
- Run `npm run check:launch`; it must pass before launch.
