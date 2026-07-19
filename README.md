# PLCY Documentation Portal

A public + customer documentation portal for PLCY, built with **Nextra** (Next.js + MDX).
Seeded from the PLCY admin console's in-app documentation.

## What's inside
- **33 articles** across 5 sections (System Usage: 5, How-to: 11, Technical: 5, Features: 8, Policies: 4) as MDX under `pages/`.
- **80 glossary terms** on `pages/glossary.mdx`.
- Two architecture diagrams in `public/diagrams/` (referenced from the Technical articles).
- Forced **light theme**, built-in full-text search, SEO-friendly static output.

## Run it
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build
```

## Authoring
Content is plain **MDX** in `pages/<section>/<slug>.mdx`. Edit in Git (PR review) or wire up a
CMS later. Section order and sidebar labels are in each `_meta.json`.

## Audience gating (important)
Every article carries an `audience:` frontmatter — `public`, `customer`, or `internal` —
seeded with a best guess (System Usage / How-to = internal). **Review these before publishing.**
Nextra does not gate by audience out of the box; for customer-only or internal content you'll add
auth (e.g. put customer/internal pages behind a login, or split into separate builds). Remove or
gate anything marked `internal` before this goes public.

## Move to its own repo
This folder is self-contained. Initialize it as a new repository, then start a fresh
Claude Code project pointed at that repo to keep building.
