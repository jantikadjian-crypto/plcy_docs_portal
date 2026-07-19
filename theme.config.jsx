import React from 'react'

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
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="PLCY — AI Governance & Policy Enforcement documentation." />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </>
  ),
}

export default config
