import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

// Published sections → sidebar labels (mirrors pages/_meta.json).
const SECTION_LABELS = {
  technical: 'Technical',
  features: 'Features',
  policies: 'Policies',
  glossary: 'Glossary',
}

// Route-aware breadcrumb rendered as a sticky bar pinned under the header, so it
// stays visible while scrolling — Home › Section › Page.
function HeaderBreadcrumb() {
  const { asPath } = useRouter()
  const { title } = useConfig()
  const path = asPath.split('#')[0].split('?')[0]
  const segs = path.split('/').filter(Boolean)
  if (segs.length === 0) return null // home has no trail

  const section = segs[0]
  const sectionLabel = SECTION_LABELS[section]
  const crumbs = [{ label: 'Home', href: '/' }]
  if (segs.length === 1) {
    // A top-level page such as /glossary.
    crumbs.push({ label: sectionLabel || title })
  } else {
    // /section/page — the section is a group with no index page, so it isn't a link.
    crumbs.push({ label: sectionLabel || section })
    crumbs.push({ label: title })
  }

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
  // Mount the sticky breadcrumb bar above every page's content.
  main: ({ children }) => (
    <>
      <HeaderBreadcrumb />
      {children}
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="PLCY — AI Governance & Policy Enforcement documentation." />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
