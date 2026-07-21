// Builds a single self-contained HTML page that demos the docs search.
//
// The point of generating it (rather than hand-writing a copy) is parity: the
// ranking code is read straight out of lib/search.js and the corpus is built
// with the same index-core the site uses, so the demo can never drift.
//
//   node scripts/build-search-demo.mjs [outFile]                 # public only
//   node scripts/build-search-demo.mjs <outFile> --include-internal
//
// The output has no external requests — index and engine are inlined — so it
// can be published as an Artifact or opened from disk.
//
// SAFETY: with --include-internal the page contains operator-only guides, so it
// must NOT land in public/ (the dev server serves that directory on the public
// site). The script refuses to write an internal build anywhere under public/.

import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildDocs } from './index-core.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const includeInternal = args.includes('--include-internal')
const outArg = args.find(a => !a.startsWith('--'))
const OUT = outArg
  ? path.resolve(outArg)
  : path.join(ROOT, 'public', 'search-demo.html')

if (includeInternal) {
  const publicDir = path.join(ROOT, 'public')
  const rel = path.relative(publicDir, OUT)
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
    console.error(
      `[demo] Refusing to write an internal-inclusive demo into public/ ` +
      `(${path.relative(ROOT, OUT)}). The public dev server would serve it. ` +
      `Pass an output path outside public/.`
    )
    process.exit(1)
  }
}

// Same walk/parse/label as the site. For the internal build we add the
// content-internal roots and give their folders their nav labels; the docs from
// those roots carry internal:true so the page can badge them.
const roots = [{ dir: path.join(ROOT, 'pages') }]
const excludeSections = new Set(['system-usage', 'how-to'])
if (includeInternal) {
  roots.push({ dir: path.join(ROOT, 'content-internal'), internal: true })
  excludeSections.clear() // let the internal root's sections through
}

const docs = buildDocs({
  roots,
  sectionLabels: { 'system-usage': 'System Usage', 'how-to': 'How-to' },
  excludeSections,
  excludeSlugs: new Set(['search', 'README']),
})

const engineSrc = readFileSync(path.join(ROOT, 'lib', 'search.js'), 'utf8')
const template = readFileSync(path.join(ROOT, 'scripts', 'search-demo.template.html'), 'utf8')

// The engine is an ES module that fetches its own index; inline it as a plain
// script instead — drop the `export` keywords and the fetch-based loader, which
// is the only part a single-file page cannot use.
const engine = engineSrc
  .replace(/^export\s+/gm, '')
  .replace(/\/\/ The index is small enough[\s\S]*?^}\n/m, '')

// `</script>` anywhere in the corpus would close the tag early; escaping `<`
// keeps the JSON valid while making that impossible.
const data = JSON.stringify({ docs }).replace(/</g, '\\u003c')

const internalCount = docs.filter(d => d.internal).length

const html = template
  .replace('/*__ENGINE__*/', () => engine)
  .replace('/*__INDEX__*/', () => data)
  .replace(/__HAS_INTERNAL__/g, () => String(includeInternal))

writeFileSync(OUT, html, 'utf8')
console.log(
  `[demo] ${docs.length} pages` +
  (includeInternal ? ` (incl. ${internalCount} internal)` : '') +
  ` → ${path.relative(ROOT, OUT)} (${Math.round(html.length / 1024)} kB)`
)
