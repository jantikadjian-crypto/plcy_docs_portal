# Audience gating

Every article in this portal targets one audience. This file is the policy and
the mechanism for keeping internal-only content out of the published site.

## The three audiences

| `audience` | Who it's for                     | Ships in the public build? |
|------------|----------------------------------|----------------------------|
| `public`   | Anyone                           | ✅ Yes |
| `customer` | PLCY customers                   | ✅ Yes (see note below) |
| `internal` | PLCY operators / staff only      | ❌ **Never** |

Each MDX file declares its audience in frontmatter:

```yaml
---
title: "…"
audience: public   # public | customer | internal
---
```

## How the gate works

The gate is **structural**, not a runtime check — the safest kind for a static
site with no auth backend:

- **`pages/`** is the built site. It contains **only `public` + `customer`**
  content (Technical, Features, Policies, Glossary). Whatever is here can be
  deployed safely.
- **`content-internal/`** holds the `internal` sections (**System Usage**,
  **How-to**). It lives **outside** the Next.js `pages/` tree, so Next never
  builds it and it can never appear on the deployed site.

Because the exclusion is "the files aren't in the build," there is no config
flag to forget and no middleware that has to run — internal content is absent
from the output by construction.

## Previewing internal content locally

Operators can still read the internal guides while working on the repo:

```bash
npm run dev:internal     # copies content-internal/* into pages/, then next dev
```

The copies are written into `pages/system-usage/` and `pages/how-to/`, which are
**git-ignored** (see `.gitignore`), so an internal preview can never be
committed into the published tree. A plain `npm run dev` / `npm run build`
removes those copies first (via `scripts/apply-audience.mjs`), so the default
build is always the safe, public one.

```bash
npm run build            # public build — internal excluded
npm run build:internal   # full build incl. internal (for an internal-only host)
```

## Changing a page's audience

1. Edit the file's `audience:` frontmatter to the correct value.
2. If you are **promoting** internal → customer/public: `git mv` the file from
   `content-internal/<section>/…` into `pages/<section>/…` and add its entry to
   that section's `_meta.json` (and, if it's a new section, to `pages/_meta.json`).
3. If you are **demoting** public/customer → internal: `git mv` it the other way,
   into `content-internal/`, and remove it from the published `_meta.json`.

## Before making the repo or site public

- The repo is **private** today — internal content is only exposed to people
  with repo access. Keep it private, or strip `content-internal/` from any
  public mirror.
- `customer` content currently ships in the public build. If PLCY wants customer
  docs behind a login, put the `pages/features/` section behind auth (e.g. a
  Next.js middleware + identity provider) or split it into a separate,
  authenticated build. Until then, treat everything in `pages/` as world-readable.
