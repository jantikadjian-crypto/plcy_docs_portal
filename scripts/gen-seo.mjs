// Generate SEO + AI-search artifacts from the published pages:
//   public/sitemap.xml       — every public URL (+ lastmod)
//   public/robots.txt        — allow all + explicitly welcome AI crawlers
//   public/llms.txt          — curated markdown index for LLMs (llmstxt.org)
//   public/llms-full.txt     — full concatenated page text for LLMs
//
// Runs as part of `prebuild` / `predev`, after the audience gate — so only the
// public (public + customer) pages under pages/ are ever indexed.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { SITE, pageUrl } from '../site.config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAGES = path.join(ROOT, 'pages')
const PUBLIC = path.join(ROOT, 'public')

const SECTION_LABEL = { technical: 'Technical', features: 'Features', policies: 'Policies' }
const SECTION_ORDER = ['technical', 'features', 'policies', 'reference']

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (e.endsWith('.mdx')) out.push(p)
  }
  return out
}

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/)
  const fm = {}
  if (!m) return { fm, body: src }
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (v.startsWith('"')) { try { v = JSON.parse(v) } catch { v = v.replace(/^"|"$/g, '') } }
    else v = v.replace(/^'|'$/g, '')
    fm[kv[1]] = v
  }
  return { fm, body: src.slice(m[0].length).replace(/^\s+/, '') }
}

function routeOf(file) {
  const rel = path.relative(PAGES, file).replace(/\\/g, '/').replace(/\.mdx$/, '')
  if (rel === 'index') return '/'
  return '/' + rel
}

// Collect published pages.
const docs = walk(PAGES).map((file) => {
  const src = readFileSync(file, 'utf8')
  const { fm, body } = parseFrontmatter(src)
  const route = routeOf(file)
  const seg = route.split('/').filter(Boolean)[0]
  const section = route === '/' ? 'home' : (SECTION_LABEL[seg] ? seg : 'reference')
  return { route, url: pageUrl(route), title: fm.title || 'PLCY Docs', description: fm.description || '', updated: fm.updated || '', section, body }
})

const byRoute = (a, b) => a.route.localeCompare(b.route)

/* ---- sitemap.xml ---- */
const urls = docs.slice().sort(byRoute).map((d) =>
  `  <url>\n    <loc>${d.url}</loc>${d.updated ? `\n    <lastmod>${d.updated}</lastmod>` : ''}\n    <changefreq>weekly</changefreq>\n  </url>`
).join('\n')
mkdirSync(PUBLIC, { recursive: true })
writeFileSync(path.join(PUBLIC, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)

/* ---- robots.txt ---- */
const AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']
writeFileSync(path.join(PUBLIC, 'robots.txt'),
  ['# PLCY Documentation', 'User-agent: *', 'Allow: /', '',
    '# AI answer engines & crawlers — explicitly welcomed',
    ...AI_AGENTS.flatMap((a) => [`User-agent: ${a}`, 'Allow: /']),
    '', `Sitemap: ${SITE.url}/sitemap.xml`, ''].join('\n'))

/* ---- llms.txt (curated index) ---- */
const llms = [`# ${SITE.name}`, '', `> ${SITE.description}`, '']
for (const key of SECTION_ORDER) {
  const list = docs.filter((d) => d.section === key).sort(byRoute)
  if (!list.length) continue
  const label = key === 'reference' ? 'Reference' : SECTION_LABEL[key]
  llms.push(`## ${label}`)
  for (const d of list) llms.push(`- [${d.title}](${d.url})${d.description ? `: ${d.description}` : ''}`)
  llms.push('')
}
writeFileSync(path.join(PUBLIC, 'llms.txt'), llms.join('\n'))

/* ---- llms-full.txt (full text) ---- */
const full = [`# ${SITE.name} — Full Documentation`, '', `> ${SITE.description}`, `Source: ${SITE.url}`, '']
for (const d of docs.slice().sort(byRoute)) {
  if (d.route === '/') continue
  full.push('', '---', '', `# ${d.title}`, `URL: ${d.url}`, '', d.body.trim(), '')
}
writeFileSync(path.join(PUBLIC, 'llms-full.txt'), full.join('\n'))

console.log(`[seo] sitemap (${docs.length} urls), robots, llms.txt, llms-full.txt written to public/`)
