// Central site metadata for SEO + AI-search. Change `url` when the public domain
// is finalized — every canonical link, Open Graph tag, sitemap entry, and
// llms.txt link is derived from it.
export const SITE = {
  url: 'https://plcy.app/docs', // base URL (no trailing slash) — the only place to edit the domain
  name: 'PLCY Docs',
  titleSuffix: 'PLCY Docs',
  org: 'PLCY',
  orgUrl: 'https://plcy.app',
  logo: '/plcy-logo.png',
  description:
    'PLCY documentation — the AI Governance & Policy Enforcement platform: architecture, deployment models, features, and policies.',
}

// Absolute URL for a route ('/', '/technical/architecture', …).
export const pageUrl = (route) => SITE.url + (route === '/' ? '' : route)
