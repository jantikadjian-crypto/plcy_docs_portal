import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'
import HeaderSearch from './components/HeaderSearch'

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
  if (segs[0] === 'search') return null // results page stands on its own

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
  // Custom search box: previews the top hits inline and hands off to the full
  // /search results page. Backed by public/search-index.json (built by
  // scripts/build-search-index.mjs) so the header and /search rank identically.
  search: {
    placeholder: 'Search documentation…',
    component: HeaderSearch,
  },
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

        /* ---- Search: header box ---- */
        .plcy-hsearch { position: relative; width: 100%; max-width: 22rem; }
        .plcy-hsearch-input {
          width: 100%;
          padding: 0.45rem 0.75rem;
          border: 1px solid rgba(17, 24, 39, 0.12);
          border-radius: 0.5rem;
          background: #f9fafb;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .plcy-hsearch-input::placeholder { color: #9ca3af; }
        .plcy-hsearch-input:focus {
          background: #fff;
          border-color: #1f6fd0;
          box-shadow: 0 0 0 3px rgba(31, 111, 208, 0.12);
        }
        .plcy-hsearch-panel {
          position: absolute;
          top: calc(100% + 0.4rem);
          right: 0;
          width: min(30rem, 90vw);
          max-height: 26rem;
          overflow-y: auto;
          background: #fff;
          border: 1px solid rgba(17, 24, 39, 0.1);
          border-radius: 0.6rem;
          box-shadow: 0 12px 32px rgba(17, 24, 39, 0.14);
          z-index: 40;
          padding: 0.3rem;
        }
        .plcy-hsearch-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.5rem 0.6rem;
          border: 0;
          border-radius: 0.4rem;
          background: transparent;
          cursor: pointer;
        }
        .plcy-hsearch-item.is-active { background: #eff5fd; }
        .plcy-hsearch-title {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }
        .plcy-hsearch-section {
          flex: none;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .plcy-hsearch-snippet {
          display: block;
          margin-top: 0.15rem;
          font-size: 0.8125rem;
          line-height: 1.4;
          color: #6b7280;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .plcy-hsearch-empty { padding: 0.75rem 0.6rem; font-size: 0.8125rem; color: #6b7280; }
        .plcy-hsearch-all {
          display: block;
          width: 100%;
          margin-top: 0.2rem;
          padding: 0.5rem 0.6rem;
          border: 0;
          border-top: 1px solid rgba(17, 24, 39, 0.08);
          background: transparent;
          text-align: left;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1f6fd0;
          cursor: pointer;
        }
        .plcy-hsearch-all:hover { background: #eff5fd; }

        /* ---- Search: /search results page ---- */
        .plcy-search-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1px solid rgba(17, 24, 39, 0.14);
          border-radius: 0.6rem;
          font-size: 1rem;
          color: #111827;
          outline: none;
        }
        .plcy-search-input:focus {
          border-color: #1f6fd0;
          box-shadow: 0 0 0 3px rgba(31, 111, 208, 0.12);
        }
        .plcy-search-count { margin-top: 0.85rem; font-size: 0.875rem; color: #6b7280; }
        .plcy-search-empty { margin-top: 0.35rem; font-size: 0.875rem; color: #6b7280; }
        .plcy-search-empty a { color: #1f6fd0; text-decoration: underline; }
        .plcy-results { list-style: none; margin: 1.25rem 0 0; padding: 0; }
        .plcy-result {
          padding: 0.9rem 0;
          border-top: 1px solid rgba(17, 24, 39, 0.08);
        }
        .plcy-result-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
        }
        .plcy-result-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f6fd0;
          text-decoration: none;
        }
        .plcy-result-title:hover { text-decoration: underline; }
        .plcy-result-section {
          flex: none;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .plcy-result-snippet {
          margin: 0.3rem 0 0;
          font-size: 0.875rem;
          line-height: 1.55;
          color: #4b5563;
        }
        .plcy-result-headings {
          list-style: none;
          margin: 0.45rem 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .plcy-result-headings a {
          display: inline-block;
          padding: 0.15rem 0.45rem;
          border: 1px solid rgba(17, 24, 39, 0.1);
          border-radius: 0.35rem;
          font-size: 0.75rem;
          color: #4b5563;
          text-decoration: none;
        }
        .plcy-result-headings a:hover { border-color: #1f6fd0; color: #1f6fd0; }
        .plcy-hit { background: #fef3c7; color: inherit; padding: 0 0.1em; border-radius: 2px; }
      `}</style>
    </>
  ),
}

export default config
