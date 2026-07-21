// Scaffold a new documentation page in the correct tree with valid frontmatter,
// and register it in the section's _meta.json so it shows up in the sidebar.
//
//   npm run new-doc                         # interactive prompts
//   npm run new-doc -- --title "My page" --section features
//   npm run new-doc -- --title "Runbook" --section how-to --audience internal
//
// The audience gate is enforced here: internal sections may only hold `internal`
// pages (written to content-internal/), and published sections may only hold
// `public`/`customer` pages (written to pages/). See AUDIENCE.md.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// section → { tree, label, category, defaultType, defaultAudience, allowed }
const SECTIONS = {
  technical: { tree: 'pages', label: 'Technical', defaultAudience: 'customer', allowed: ['public', 'customer'] },
  features:  { tree: 'pages', label: 'Features',  defaultAudience: 'customer', allowed: ['public', 'customer'] },
  policies:  { tree: 'pages', label: 'Policies',  defaultAudience: 'customer', allowed: ['public', 'customer'] },
  'system-usage': { tree: 'content-internal', label: 'System Usage', defaultAudience: 'internal', allowed: ['internal'] },
  'how-to':       { tree: 'content-internal', label: 'How-to', defaultType: 'Guide', defaultAudience: 'internal', allowed: ['internal'] },
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
      out[key] = val
    }
  }
  return out
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function ask(rl, q, def) {
  return new Promise(res =>
    rl.question(def ? `${q} [${def}]: ` : `${q}: `, a => res(a.trim() || def || ''))
  )
}

async function collect() {
  const args = parseArgs(process.argv.slice(2))
  if (args.title && args.section) return args // fully non-interactive

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const title = args.title || (await ask(rl, 'Title'))
  const section =
    args.section ||
    (await ask(rl, `Section (${Object.keys(SECTIONS).join(' / ')})`, 'features'))
  const meta = SECTIONS[section]
  const audience = args.audience || (await ask(rl, 'Audience', meta?.defaultAudience))
  const tags = args.tags || (await ask(rl, 'Tags (comma-separated)', ''))
  rl.close()
  return { title, section, audience, tags, slug: args.slug, type: args.type }
}

function fail(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

const input = await collect()
const meta = SECTIONS[input.section]
if (!meta) fail(`Unknown section "${input.section}". Choose one of: ${Object.keys(SECTIONS).join(', ')}`)

const title = (input.title || '').trim()
if (!title) fail('A title is required.')

const audience = (input.audience || meta.defaultAudience).toLowerCase()
if (!meta.allowed.includes(audience)) {
  fail(
    `Audience "${audience}" is not allowed in section "${input.section}". ` +
    `Allowed: ${meta.allowed.join(', ')}. ` +
    `(Internal pages live in content-internal/; published pages in pages/. See AUDIENCE.md.)`
  )
}

const slug = slugify(input.slug || title)
const type = input.type || meta.defaultType || 'Document'
const tags = (input.tags || '')
  .split(',')
  .map(t => t.trim())
  .filter(Boolean)
const today = new Date().toISOString().slice(0, 10)

const dir = path.join(ROOT, meta.tree, input.section)
const file = path.join(dir, `${slug}.mdx`)
if (existsSync(file)) fail(`${path.relative(ROOT, file)} already exists.`)

const frontmatter = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `category: ${JSON.stringify(meta.label)}`,
  `type: ${JSON.stringify(type)}`,
  `audience: ${audience}`,
  `updated: ${JSON.stringify(today)}`,
  `tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]`,
  '---',
  '',
].join('\n')

const body = `# ${title}

<Lead>One-sentence summary of this page.</Lead>

Write your content here. You can drop in rich blocks with no import — for the
full set and live examples, see the Rich content guide.

<Callout type="tip" title="Tip">
  \`npm run dev\` and open this page to see edits live.
</Callout>
`

mkdirSync(dir, { recursive: true })
writeFileSync(file, frontmatter + body, 'utf8')

// Register in the section's _meta.json (append; author can reorder later).
const metaFile = path.join(dir, '_meta.json')
let metaObj = {}
if (existsSync(metaFile)) {
  try { metaObj = JSON.parse(readFileSync(metaFile, 'utf8')) } catch { metaObj = {} }
}
if (!(slug in metaObj)) {
  metaObj[slug] = title
  writeFileSync(metaFile, JSON.stringify(metaObj, null, 2) + '\n', 'utf8')
}

const previewCmd = meta.tree === 'content-internal' ? 'npm run dev:internal' : 'npm run dev'
console.log(`\n✔ Created ${path.relative(ROOT, file)}`)
console.log(`  Registered in ${path.relative(ROOT, metaFile)}`)
console.log(`  Preview:  ${previewCmd}  →  /${[input.section, slug].join('/')}\n`)
