import React from 'react'

// Small status pill. Tone maps to a color; falls back to neutral.
const TONES = new Set(['neutral', 'blue', 'green', 'amber', 'red'])

export default function Badge({ tone = 'neutral', children }) {
  const t = TONES.has(tone) ? tone : 'neutral'
  return <span className={`plcy-badge is-${t}`}>{children}</span>
}
