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
// Runs automatically before `dev` / `build`, after scripts/apply-audience.mjs.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAGES = path.join(ROOT, 'pages')
const OUT = path.join(ROOT, 'public', 'search-index.json')

// Never indexed: internal-audience previews, and the search page itself.
const EXCLUDED_SECTIONS = new Set(['system-usage', 'how-to'])
const EXCLUDED_SLUGS = new Set(['search'])

// Sidebar labels come from each folder's _meta.json, so the index shows the
// same section/page names the reader sees in the nav.
function readMeta(dir) {
  const file = path.join(dir, '_meta.json')
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

// Minimal YAML frontmatter reader — enough for the fixed key set every article
// uses (title, category, type, audience, updated, tags). Avoids a dependency.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (!kv) continue
    let [, key, value] = kv
    value = value.trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = value.replace(/^["']|["']$/g, '')
    }
  }
  return { data, body: raw.slice(m[0].length) }
}

// Flatten MDX to prose so snippets read like sentences rather than markup.
function toPlainText(mdx) {
  return mdx
    .replace(/```[\s\S]*?```/g, ' ')            // fenced code
    .replace(/^import .*$/gm, ' ')              // MDX imports
    .replace(/<[^>]+>/g, ' ')                   // JSX / HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links → link text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')         // heading markers
    .replace(/^\s{0,3}[-*+]\s+/gm, '')          // list bullets
    .replace(/^\s{0,3}(---|\*\*\*)\s*$/gm, ' ') // rules
    .replace(/[`*_>|]/g, '')                    // leftover emphasis
    .replace(/\s+/g, ' ')
    .trim()
}

// The `## Heading` list gives each result a set of jump targets and gives the
// scorer a middle tier between "title match" and "somewhere in the body".
function extractHeadings(mdx) {
  const out = []
  for (const m of mdx.matchAll(/^\s{0,3}(#{2,3})\s+(.+?)\s*#*\s*$/gm)) {
    const text = toPlainText(m[2])
    if (!text) continue
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    out.push({ text, id })
  }
  return out
}

const topMeta = readMeta(PAGES)
const docs = []

function walk(dir, section) {
  const meta = readMeta(dir)
  for (const entry of readdirSync(dir).sort()) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (EXCLUDED_SECTIONS.has(entry)) continue
      walk(full, entry)
      continue
    }
    if (!entry.endsWith('.mdx') && !entry.endsWith('.md')) continue

    const slug = entry.replace(/\.mdx?$/, '')
    if (EXCLUDED_SLUGS.has(slug)) continue

    const raw = readFileSync(full, 'utf8')
    const { data, body } = parseFrontmatter(raw)

    // Route: /section/slug, with index pages collapsing to their folder.
    const parts = section ? [section] : []
    if (slug !== 'index') parts.push(slug)
    const route = '/' + parts.join('/')

    const sectionLabel = section ? topMeta[section] || section : null

    docs.push({
      route: route === '/' ? '/' : route,
      title: data.title || meta[slug] || slug,
      // The sidebar label is often shorter than the frontmatter title; index
      // both so either phrasing finds the page.
      navTitle: meta[slug] || null,
      section: sectionLabel,
      category: data.category || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      updated: data.updated || null,
      headings: extractHeadings(body),
      text: toPlainText(body),
    })
  }
}

walk(PAGES, null)

writeFileSync(OUT, JSON.stringify({ docs }), 'utf8')
console.log(`[search] Indexed ${docs.length} published pages → public/search-index.json`)
