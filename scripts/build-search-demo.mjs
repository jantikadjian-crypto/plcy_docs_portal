// Builds a single self-contained HTML page that demos the docs search.
//
// The point of generating it (rather than hand-writing a copy) is parity: the
// ranking code is read straight out of lib/search.js and the corpus straight
// out of the generated index, so the demo can never drift from the real site.
//
//   node scripts/build-search-demo.mjs [outFile]
//
// The output has no external requests — index and engine are inlined — so it
// can be published as an Artifact or opened from disk.

import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = process.argv[2] || path.join(ROOT, 'public', 'search-demo.html')

const engineSrc = readFileSync(path.join(ROOT, 'lib', 'search.js'), 'utf8')
const index = JSON.parse(readFileSync(path.join(ROOT, 'public', 'search-index.json'), 'utf8'))
const template = readFileSync(path.join(ROOT, 'scripts', 'search-demo.template.html'), 'utf8')

// The engine is an ES module that fetches its own index; inline it as a plain
// script instead — drop the `export` keywords and the fetch-based loader, which
// is the only part a single-file page cannot use.
const engine = engineSrc
  .replace(/^export\s+/gm, '')
  .replace(/\/\/ The index is small enough[\s\S]*?^}\n/m, '')

// `</script>` anywhere in the corpus would close the tag early; escaping `<`
// keeps the JSON valid while making that impossible.
const data = JSON.stringify(index).replace(/</g, '\\u003c')

const html = template
  .replace('/*__ENGINE__*/', () => engine)
  .replace('/*__INDEX__*/', () => data)

writeFileSync(OUT, html, 'utf8')
console.log(`[demo] ${index.docs.length} pages → ${path.relative(ROOT, OUT)} (${Math.round(html.length / 1024)} kB)`)
