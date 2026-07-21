// Shared indexing core for the docs search.
//
// One implementation of "walk a docs tree → ranked-searchable docs", used by:
//   - build-search-index.mjs  → the PUBLIC index shipped with the site
//                                (pages/ only; internal sections excluded).
//   - build-search-demo.mjs   → the shareable static demo, which may ALSO fold
//                                in the internal guides for an internal preview.
//
// Keeping it in one place means both surfaces parse frontmatter, flatten MDX,
// and label sections identically — the demo can never rank differently from the
// site for the pages they share.

import { readdirSync, statSync, readFileSync } from 'fs'
import path from 'path'

// Sidebar labels come from each folder's _meta.json, so the index shows the
// same section/page names the reader sees in the nav.
export function readMeta(dir) {
  try {
    return JSON.parse(readFileSync(path.join(dir, '_meta.json'), 'utf8'))
  } catch {
    return {}
  }
}

// Minimal YAML frontmatter reader — enough for the fixed key set every article
// uses (title, category, type, audience, updated, tags). Avoids a dependency.
export function parseFrontmatter(raw) {
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
export function toPlainText(mdx) {
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
export function extractHeadings(mdx) {
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

// Walk one or more docs trees into a flat list of searchable docs.
//
//   roots        — [{ dir, internal? }]. Each dir's direct subfolders become
//                  sections; loose .mdx files at its top level are section-less
//                  pages (e.g. pages/index.mdx → "/"). `internal: true` tags
//                  every doc from that root so callers can badge or filter it.
//   sectionLabels — folder-name → display label, applied across all roots.
//                  Falls back to the root's own _meta.json, then the raw name.
//   excludeSections / excludeSlugs — folder / file names to skip everywhere.
//
// Deterministic: entries are sorted, so the same inputs always yield the same
// index (stable output diffs, cache-friendly).
export function buildDocs({
  roots,
  sectionLabels = {},
  excludeSections = new Set(),
  excludeSlugs = new Set(),
}) {
  const docs = []

  for (const root of roots) {
    const rootMeta = readMeta(root.dir)

    const walk = (dir, section) => {
      const meta = readMeta(dir)
      for (const entry of readdirSync(dir).sort()) {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) {
          if (excludeSections.has(entry)) continue
          walk(full, entry)
          continue
        }
        if (!entry.endsWith('.mdx') && !entry.endsWith('.md')) continue

        const slug = entry.replace(/\.mdx?$/, '')
        if (excludeSlugs.has(slug)) continue

        const raw = readFileSync(full, 'utf8')
        const { data, body } = parseFrontmatter(raw)

        // Route: /section/slug, with index pages collapsing to their folder.
        const parts = section ? [section] : []
        if (slug !== 'index') parts.push(slug)
        const route = '/' + parts.join('/')

        const sectionLabel = section
          ? sectionLabels[section] || rootMeta[section] || section
          : null

        const doc = {
          route: route === '/' ? '/' : route,
          title: data.title || meta[slug] || slug,
          // The sidebar label is often shorter than the frontmatter title; index
          // both so either phrasing finds the page.
          navTitle: meta[slug] || null,
          section: sectionLabel,
          category: data.category || null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          updated: data.updated || null,
        }
        // Only present on internal docs, so the public index is unchanged and
        // callers can badge/filter internal results by the field's presence.
        if (root.internal) doc.internal = true
        doc.headings = extractHeadings(body)
        doc.text = toPlainText(body)
        docs.push(doc)
      }
    }

    walk(root.dir, null)
  }

  return docs
}
