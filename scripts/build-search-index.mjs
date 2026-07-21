// Build-time search index for the docs portal's /search page.
//
// Walks the PUBLISHED tree only (`pages/`) and emits `public/search-index.json`,
// which the client fetches once and queries in the browser — no search server.
//
// The audience gate is enforced structurally here, same as everywhere else:
// the internal sections are skipped by name, so even when they are previewed
// via `npm run dev:internal` (which copies them into `pages/`) they never make
// it into the index. See AUDIENCE.md.
//
// The walk/parse/label logic lives in index-core.mjs so the shareable demo
// (build-search-demo.mjs) indexes identically.
//
// Runs automatically before `dev` / `build`, after scripts/apply-audience.mjs.

import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildDocs } from './index-core.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'search-index.json')

const docs = buildDocs({
  roots: [{ dir: path.join(ROOT, 'pages') }],
  // Internal-audience previews, and the search page itself, are never indexed.
  excludeSections: new Set(['system-usage', 'how-to']),
  excludeSlugs: new Set(['search']),
})

writeFileSync(OUT, JSON.stringify({ docs }), 'utf8')
console.log(`[search] Indexed ${docs.length} published pages → public/search-index.json`)
