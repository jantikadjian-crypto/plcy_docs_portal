# PLCY Documentation Portal

A public + customer documentation portal for PLCY, built with **Nextra** (Next.js + MDX).
Seeded from the PLCY admin console's in-app documentation.

## What's inside
- **17 published articles** as MDX under `pages/` — Technical (5), Features (8),
  Policies (4) — plus the home page and an **80-term glossary** (`pages/glossary.mdx`).
- **16 internal-only guides** — System Usage (5), How-to (11) — held in
  `content-internal/`, **outside the build** (see Audience gating below).
- Two architecture diagrams in `public/diagrams/` (referenced from the Technical articles).
- Forced **light theme**, built-in full-text search, SEO-friendly static output.

## Run it
```bash
npm install
npm run dev            # http://localhost:3000  (public site)
npm run build          # production build (public — safe to deploy)

npm run dev:internal   # public site + internal guides, for local review only
```

## Deploy (Vercel)
This repo is Vercel-ready — `vercel.json` pins the framework and build command so the
audience gate runs on every deploy.

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project**, then **Import** `jantikadjian-crypto/plcy_docs_portal`
   (authorize Vercel for the repo if prompted — it works with private repos).
3. Vercel auto-detects Next.js. Leave the defaults (build `npm run build`,
   output handled automatically) and click **Deploy**.
4. You get a live URL (e.g. `plcy-docs-portal.vercel.app`). Every push to `main`
   redeploys automatically; pull requests get preview URLs.

The deployed site is the **public build** — `internal` guides are excluded, so the
URL is safe to share. The Vercel URL is publicly reachable by default; for a private
site or a custom domain, configure it in the Vercel project settings.

## Authoring
Published content is plain **MDX** in `pages/<section>/<slug>.mdx`. Section order
and sidebar labels live in each `_meta.json`. Edit in Git (PR review) or wire up a
CMS later.

## Audience gating (important)
Every article carries an `audience:` frontmatter — `public`, `customer`, or `internal`.
The gate is **structural**: `pages/` holds only publishable (`public` + `customer`)
content, while `internal` content lives in `content-internal/`, outside the Next.js
build, so it can never ship by accident. Internal guides can still be previewed
locally with `npm run dev:internal`.

**See [`AUDIENCE.md`](./AUDIENCE.md) for the full policy** — how the gate works,
how to promote/demote a page, and what to check before making the site public.

## Keep building
This repo is self-contained. Start a Claude Code session pointed at it (its
`CLAUDE.md` briefs the project) to keep working — separate from the admin console.
