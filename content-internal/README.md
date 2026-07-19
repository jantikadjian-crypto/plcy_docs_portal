# content-internal/

**Internal-audience content — NOT part of the published site.**

These sections (**System Usage**, **How-to**) are operator-only guides that walk
through PLCY admin-console actions. They live here, outside the Next.js `pages/`
tree, so they are never built into or deployed with the public site.

- To read them locally: `npm run dev:internal` (see `../AUDIENCE.md`).
- To publish one: change its `audience:` frontmatter and `git mv` it into
  `../pages/<section>/`, then add it to that section's `_meta.json`.

Do not move this folder under `pages/`. See `../AUDIENCE.md` for the full policy.
