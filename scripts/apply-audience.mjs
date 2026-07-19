// Audience gate for the PLCY docs portal.
//
// The PUBLISHED site is everything under `pages/` — only `public` + `customer`
// content lives there, so it is always safe to deploy. `internal` content
// (operator-only System Usage + How-to guides) is kept in `content-internal/`,
// OUTSIDE the Next build, so it can never ship by accident.
//
// This script runs automatically before `dev` / `build` (npm pre-hooks):
//   - default            → CLEAN: remove any previewed internal sections from `pages/`.
//   - SITE_AUDIENCE=internal → PREVIEW: copy internal sections INTO `pages/` for
//                              local review only (these copies are git-ignored).
//
// The copied preview folders are listed in .gitignore, so an internal preview
// can never be committed into the published tree.

import {
  readdirSync, existsSync, mkdirSync, copyFileSync, rmSync, statSync,
} from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAGES = path.join(ROOT, 'pages')
const INTERNAL = path.join(ROOT, 'content-internal')
const INTERNAL_SECTIONS = ['system-usage', 'how-to']

const audience = (process.env.SITE_AUDIENCE || 'public').toLowerCase()
const includeInternal = audience === 'internal'

function rmDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
}
function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true })
  for (const entry of readdirSync(src)) {
    const s = path.join(src, entry)
    const d = path.join(dst, entry)
    if (statSync(s).isDirectory()) copyDir(s, d)
    else copyFileSync(s, d)
  }
}

// Always start clean so switching modes never leaves stale copies behind.
for (const section of INTERNAL_SECTIONS) rmDir(path.join(PAGES, section))

if (includeInternal) {
  for (const section of INTERNAL_SECTIONS) {
    const src = path.join(INTERNAL, section)
    if (existsSync(src)) copyDir(src, path.join(PAGES, section))
  }
  console.log('[audience] INTERNAL preview — System Usage + How-to copied into pages/ (not committable).')
} else {
  console.log('[audience] PUBLIC build — internal sections excluded (public + customer only).')
}
