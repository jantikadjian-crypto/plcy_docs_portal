import { config, collection, fields } from '@keystatic/core'
import { docComponents } from './keystatic.components'

// Visual editor for the docs portal (phase 2). LOCAL mode: reads/writes the MDX
// files in this repo directly during `npm run dev` — no server, no auth. For
// non-technical editors once the site is deployed, switch `storage` to
// { kind: 'github', repo: 'jantikadjian-crypto/plcy_docs_portal' } and add the
// Keystatic GitHub App (see CLAUDE.md).
//
// One collection per docs section. The schema mirrors the frontmatter every
// article uses — Keystatic drops any frontmatter key NOT in the schema on save,
// so every key is represented. The rich components (components/mdx/) are wired
// as editor blocks via docComponents, shared across all collections.
//
// AUDIENCE GATE: published collections live under pages/ and only offer
// public/customer; internal collections live under content-internal/ and only
// offer internal. The structural gate (which folder a file is in) is preserved
// because each collection writes to a fixed tree. See AUDIENCE.md.

const TYPE_OPTIONS = [
  { label: 'Document', value: 'Document' },
  { label: 'Guide', value: 'Guide' },
  { label: 'Graphic', value: 'Graphic' },
]

// Frontmatter shared by all sections. `audienceOptions` differs by tree so the
// gate can't be violated from the editor.
function docSchema({ sectionLabel, audienceOptions, audienceDefault }) {
  return {
    title: fields.slug({ name: { label: 'Title' } }),
    category: fields.text({ label: 'Category', defaultValue: sectionLabel }),
    type: fields.select({ label: 'Type', options: TYPE_OPTIONS, defaultValue: 'Document' }),
    audience: fields.select({
      label: 'Audience',
      options: audienceOptions,
      defaultValue: audienceDefault,
    }),
    updated: fields.date({ label: 'Last updated' }),
    tags: fields.array(fields.text({ label: 'Tag' }), {
      label: 'Tags',
      itemLabel: props => props.value,
    }),
    description: fields.text({
      label: 'Description',
      description: 'One sentence — used for SEO and search snippets.',
      multiline: true,
    }),
    content: fields.mdx({ label: 'Body', components: docComponents }),
  }
}

function docCollection({ label, path, sectionLabel, audienceOptions, audienceDefault }) {
  return collection({
    label,
    path,
    slugField: 'title',
    format: { contentField: 'content' },
    entryLayout: 'content',
    columns: ['title', 'updated'],
    schema: docSchema({ sectionLabel, audienceOptions, audienceDefault }),
  })
}

const PUBLISHED_AUDIENCE = [
  { label: 'Public', value: 'public' },
  { label: 'Customer', value: 'customer' },
]
const INTERNAL_AUDIENCE = [{ label: 'Internal', value: 'internal' }]

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'PLCY Docs' },
    navigation: {
      Published: ['technical', 'features', 'policies'],
      'Internal (operator-only)': ['systemUsage', 'howTo'],
    },
  },
  collections: {
    // ---- Published (pages/) — public + customer only ----
    technical: docCollection({
      label: 'Technical',
      path: 'pages/technical/*',
      sectionLabel: 'Technical',
      audienceOptions: PUBLISHED_AUDIENCE,
      audienceDefault: 'customer',
    }),
    features: docCollection({
      label: 'Features',
      path: 'pages/features/*',
      sectionLabel: 'Features',
      audienceOptions: PUBLISHED_AUDIENCE,
      audienceDefault: 'customer',
    }),
    policies: docCollection({
      label: 'Policies',
      path: 'pages/policies/*',
      sectionLabel: 'Policies',
      audienceOptions: PUBLISHED_AUDIENCE,
      audienceDefault: 'customer',
    }),

    // ---- Internal (content-internal/) — internal only, kept out of the build ----
    systemUsage: docCollection({
      label: 'System Usage',
      path: 'content-internal/system-usage/*',
      sectionLabel: 'System Usage',
      audienceOptions: INTERNAL_AUDIENCE,
      audienceDefault: 'internal',
    }),
    howTo: docCollection({
      label: 'How-to',
      path: 'content-internal/how-to/*',
      sectionLabel: 'How-to',
      audienceOptions: INTERNAL_AUDIENCE,
      audienceDefault: 'internal',
    }),
  },
})
