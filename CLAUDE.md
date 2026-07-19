# PLCY Documentation Portal

Public + customer-facing documentation site for PLCY (AI Governance & Policy
Enforcement platform), built with **Nextra 2** (Next.js + MDX). Content was
seeded from the PLCY admin console's in-app documentation and now lives here as
plain MDX. This repo is **docs only** — it is separate from the `plcy_admin_console`
application repo.

Stack: Next.js 13 · Nextra 2 (`nextra-theme-docs`) · MDX · React 18.
**Light mode only** — dark mode is intentionally disabled (see `theme.config.jsx`).

---

## Working preferences

> This section captures how Jack likes to work. **Add to or edit it any time** —
> just say "add this to my preferences" and it goes here. New sessions read this
> file automatically, so preferences persist across sessions.

1. **Always end an update with a "How to see it" block** so the change can be
   verified. Include:
   - **Preview** — how to view it (`npm run dev` → the exact page path, e.g.
     `http://localhost:3000/technical/architecture`).
   - **Code** — the commit hash and PR link, so the diff can be read.
   - A **tip** when useful (e.g. which page shows it best, hard-refresh).

---

## Repository layout

- `pages/` — the **published** site (publishable content only), one folder per
  section: `technical/`, `features/`, `policies/`.
  - `index.mdx` — the home page; `glossary.mdx` — the full term glossary.
  - Each section folder has a `_meta.json` controlling **sidebar order + labels**.
    The top-level `pages/_meta.json` controls the section order.
- `content-internal/` — **internal-only** sections (`system-usage/`, `how-to/`),
  kept OUTSIDE the Next build so they never ship. Preview locally with
  `npm run dev:internal`. See `AUDIENCE.md`.
- `public/diagrams/` — `architecture.svg`, `network-topology.svg` (referenced
  from the Technical articles as `![](/diagrams/<file>.svg)`).
- `scripts/apply-audience.mjs` — pre-`dev`/`build` hook that enforces the gate
  (excludes internal by default; copies it in for `dev:internal`).
- `theme.config.jsx` — Nextra theme config. Light forced via `darkMode:false` +
  `nextThemes:{defaultTheme:'light',forcedTheme:'light'}`. Logo, footer, search
  placeholder, primary hue live here.
- `next.config.mjs` — Nextra wrapper; `eslint.ignoreDuringBuilds:true`.

## Authoring content

- Add a **published** article: create `pages/<section>/<slug>.mdx`, then add its
  `slug: "Sidebar Title"` entry to that section's `_meta.json`.
- Every article carries frontmatter: `title`, `category`, `type`, `audience`,
  `updated`, `tags`.
- **`audience:` gating (read `AUDIENCE.md`).** Values are `public`, `customer`,
  `internal`. The gate is **structural**: `pages/` = `public` + `customer` only
  (always safe to deploy); `internal` lives in `content-internal/`, outside the
  build. To promote/demote a page, `git mv` it between the two trees and update
  the relevant `_meta.json` — never leave `internal`-tagged files under `pages/`.

## Commands

```bash
npm install
npm run dev            # http://localhost:3000  (public site)
npm run build          # static production build (public — safe to deploy)
npm run dev:internal   # public site + internal guides, local review only
```

## Ship checklist (for the assistant)

Before reporting an update done: `npm run build` (must exit 0) → browser-verify
the changed page(s) → commit → push → (if a PR is open) note the commit on it.
End the message with the "How to see it" block above.
