import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'
import { SITE, pageUrl } from './site.config.mjs'

// Published sections → sidebar labels (mirrors pages/_meta.json).
const SECTION_LABELS = {
  technical: 'Technical',
  features: 'Features',
  policies: 'Policies',
  glossary: 'Glossary',
}

function crumbsFor(path, title) {
  const segs = path.split('/').filter(Boolean)
  if (segs.length === 0) return null
  const section = segs[0]
  const sectionLabel = SECTION_LABELS[section]
  const crumbs = [{ label: 'Home', href: '/' }]
  if (segs.length === 1) {
    crumbs.push({ label: sectionLabel || title })
  } else {
    crumbs.push({ label: sectionLabel || section, href: `/${section}` })
    crumbs.push({ label: title })
  }
  return crumbs
}

// Route-aware breadcrumb rendered as a sticky bar pinned under the header, so it
// stays visible while scrolling — Home › Section › Page.
function HeaderBreadcrumb() {
  const { asPath } = useRouter()
  const { title } = useConfig()
  const path = asPath.split('#')[0].split('?')[0]
  const crumbs = crumbsFor(path, title)
  if (!crumbs) return null

  return (
    <nav aria-label="Breadcrumb" className="plcy-crumbs">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1
        return (
          <span key={i} className="plcy-crumb">
            {i > 0 && <span className="plcy-crumb-sep" aria-hidden="true">›</span>}
            {c.href && !last ? (
              <Link href={c.href} className="plcy-crumb-link">{c.label}</Link>
            ) : (
              <span className={last ? 'plcy-crumb-current' : 'plcy-crumb-link'} aria-current={last ? 'page' : undefined}>{c.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// Per-page structured data (JSON-LD): a TechArticle + a BreadcrumbList so Google
// and AI answer engines can ground each page and its place in the hierarchy.
function SeoJsonLd() {
  const { asPath } = useRouter()
  const { title, frontMatter } = useConfig()
  const path = asPath.split('#')[0].split('?')[0]
  if (path === '/') return null // home is covered by the global Organization/WebSite schema

  const url = pageUrl(path)
  const description = frontMatter?.description || SITE.description
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description,
      url,
      ...(frontMatter?.updated ? { dateModified: frontMatter.updated } : {}),
      inLanguage: 'en',
      author: { '@type': 'Organization', name: SITE.org, url: SITE.orgUrl },
      publisher: {
        '@type': 'Organization',
        name: SITE.org,
        logo: { '@type': 'ImageObject', url: SITE.url + SITE.logo },
      },
    },
  ]
  const crumbs = crumbsFor(path, title)
  if (crumbs) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        ...(c.href ? { item: pageUrl(c.href) } : {}),
      })),
    })
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph.length === 1 ? graph[0] : graph) }}
    />
  )
}

// Light-only PLCY documentation portal. Dark mode is disabled and the theme is
// forced to light per requirement.
const config = {
  logo: (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
      <img src="/plcy-logo.png" alt="PLCY" style={{ height: 22, width: 'auto' }} />
      <span style={{ fontWeight: 600, fontSize: '1rem', color: '#6b7280', letterSpacing: '-0.01em' }}>Docs</span>
    </span>
  ),
  darkMode: false,
  nextThemes: { defaultTheme: 'light', forcedTheme: 'light' },
  primaryHue: 224,
  search: { placeholder: 'Search documentation…' },
  sidebar: { defaultMenuCollapseLevel: 1 },
  footer: { text: 'PLCY, Inc. · Documentation' },
  feedback: { content: null },
  editLink: { text: null },

  // Per-page SEO: branded title, canonical URL, Open Graph, Twitter card.
  // Page title + description come from each page's frontmatter (Nextra merges them).
  useNextSeoProps() {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()
    const path = asPath.split('#')[0].split('?')[0]
    const url = pageUrl(path)
    return {
      titleTemplate: `%s – ${SITE.titleSuffix}`,
      description: frontMatter?.description || SITE.description,
      canonical: url,
      openGraph: {
        type: 'website',
        url,
        siteName: SITE.name,
        images: [{ url: SITE.url + SITE.logo, alt: SITE.org }],
      },
      twitter: { cardType: 'summary_large_image' },
    }
  },

  // Mount the sticky breadcrumb bar + per-page structured data above each page.
  main: ({ children }) => (
    <>
      <SeoJsonLd />
      <HeaderBreadcrumb />
      {children}
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index,follow" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      {/* Site-wide structured data: who PLCY is + the site itself. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE.org,
              url: SITE.orgUrl,
              logo: SITE.url + SITE.logo,
              description: SITE.description,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE.name,
              url: SITE.url,
              publisher: { '@type': 'Organization', name: SITE.org, url: SITE.orgUrl },
            },
          ]),
        }}
      />
      <style>{`
        /* Hide Nextra's default in-content breadcrumb — replaced by the sticky bar. */
        .nextra-breadcrumb { display: none !important; }
        /* Sticky breadcrumb bar, pinned just under the header. */
        .plcy-crumbs {
          position: sticky;
          top: var(--nextra-navbar-height, 4rem);
          z-index: 10;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin: -1rem 0 1.5rem;
          padding: 0.6rem 0;
          background: #fff;
          border-bottom: 1px solid rgba(17, 24, 39, 0.08);
          font-size: 0.8125rem;
          line-height: 1.2;
        }
        .plcy-crumb { display: inline-flex; align-items: center; gap: 0.35rem; }
        .plcy-crumb-sep { color: #9ca3af; }
        .plcy-crumb-link { color: #6b7280; text-decoration: none; font-weight: 500; }
        .plcy-crumb-link:hover { color: rgb(var(--nextra-primary-hue, 224) 0% 0%); }
        a.plcy-crumb-link:hover { color: #1f6fd0; }
        .plcy-crumb-current { color: #111827; font-weight: 600; }
      `}</style>
    </>
  ),
}

export default config
