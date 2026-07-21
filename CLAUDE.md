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
- `scripts/build-search-index.mjs` — pre-`dev`/`build` hook that walks `pages/`
  and writes `public/search-index.json` (git-ignored, regenerated every build).
  It skips the internal sections **by name**, so an internal preview can never
  leak into the index.
- `lib/search.js` — the client-side query engine (load / rank / snippet /
  highlight), shared by both search surfaces so they rank identically.
- `components/HeaderSearch.jsx` — the navbar search box (top 5 hits inline,
  Enter → full results). Wired in via `search.component` in `theme.config.jsx`,
  replacing Nextra's built-in FlexSearch box.
- `components/SearchResults.jsx` + `pages/search.mdx` — the `/search?q=…`
  results page. Hidden from the sidebar via `pages/_meta.json`.
- `theme.config.jsx` — Nextra theme config. Light forced via `darkMode:false` +
  `nextThemes:{defaultTheme:'light',forcedTheme:'light'}`. Logo, footer, search
  placeholder, primary hue live here.
- `next.config.mjs` — Nextra wrapper; `eslint.ignoreDuringBuilds:true`.

## Authoring content

- **Visual editor (Keystatic):** `npm run dev` → open `/keystatic`. A WYSIWYG
  admin with a formatting toolbar and insertable blocks (YouTube, Video, Image,
  Callout, Button, Badge, Columns, Cards, color/highlight/font). It reads/writes
  the same `.mdx` files, one collection per section, and **preserves the audience
  gate** (published collections only offer public/customer and write to `pages/`;
  internal collections only offer internal and write to `content-internal/`).
  - **Storage is LOCAL mode** — edits the working copy directly, no auth. It only
    works under `npm run dev`. Config: `keystatic.config.jsx`; the editor blocks
    that mirror `components/mdx/` live in `keystatic.components.jsx`; routes are
    `pages/keystatic/[[...params]].jsx` + `pages/api/keystatic/[...params].js`.
  - **Before deploying:** switch `storage` to `{ kind: 'github', repo: … }` and
    add the Keystatic GitHub App so non-technical editors get a hosted, logged-in
    admin — otherwise `/keystatic` ships publicly but can't function (local mode
    needs the filesystem). That is phase-2's remaining step (needs the site live).
  - Keystatic normalizes files it saves (unquoted YAML frontmatter, `*` bullets,
    block-list tags, explicit attribute defaults) — cosmetic, renders identically.
  - Hand-authored MDX only: **block components must be multi-line**
    (`<Callout …>\n  text\n</Callout>`, not `<Callout>text</Callout>`) or Keystatic
    can't parse the file. The editor always writes the correct form.
  - New pages created in Keystatic are **not** auto-added to `_meta.json`, so they
    render but sit at the end of the sidebar until you add a `_meta.json` entry
    (or scaffold via `npm run new-doc`, which registers it).
- **Scaffold a new doc:** `npm run new-doc` (interactive) or
  `npm run new-doc -- --title "…" --section features [--audience customer]`.
  It writes the `.mdx` with valid frontmatter into the correct tree, registers
  it in that section's `_meta.json`, and **enforces the audience gate** (internal
  sections only accept `internal`; published sections only `public`/`customer`).
- **Rich content components** (media, callouts, layout) are available in **every**
  `.mdx` with no import — they're provided globally via `pages/_app.jsx`
  (`<MDXProvider>`) from `components/mdx/`. The set: `<YouTube>`, `<Video>`,
  `<Figure>`, `<Callout>`, `<Button>`, `<Badge>`, `<Color>`, `<Highlight>`,
  `<Lead>`, `<Font>`, `<Columns>/<Column>`, `<Card>/<CardGrid>`. Styles live in
  `styles/mdx.css`. Live reference + examples: the **Rich content** guide at
  `content-internal/how-to/howto-rich-content.mdx` (view via `npm run dev:internal`).
  Adding a component to `components/mdx/index.js` makes it available site-wide.
- Add a **published** article by hand: create `pages/<section>/<slug>.mdx`, then
  add its `slug: "Sidebar Title"` entry to that section's `_meta.json`.
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
