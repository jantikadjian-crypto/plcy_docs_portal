import React from 'react'

// Light-only PLCY documentation portal. Dark mode is disabled and the theme is
// forced to light per requirement.
const config = {
  logo: <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>PLCY Docs</span>,
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
    </>
  ),
}

export default config
