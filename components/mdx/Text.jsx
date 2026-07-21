import React from 'react'

// Inline colored text. `value` is any CSS color (hex, rgb, named). Use for
// emphasis sparingly — semantic Callouts read better for whole notes.
export function Color({ value = 'inherit', children }) {
  return <span style={{ color: value }}>{children}</span>
}

// Inline highlight (marker pen). `color` sets the background swatch.
export function Highlight({ color = '#fef3c7', children }) {
  return (
    <mark className="plcy-mark" style={{ background: color }}>
      {children}
    </mark>
  )
}

// A larger intro paragraph — the standfirst under a page title.
export function Lead({ children }) {
  return <p className="plcy-lead">{children}</p>
}

// Arbitrary font control for one-off needs (brand wordmarks, code-y labels).
// Prefer the site's type scale; reach for this only when you truly need it.
export function Font({ family, size, weight, children }) {
  const style = {}
  if (family) style.fontFamily = family
  if (size) style.fontSize = typeof size === 'number' ? `${size}px` : size
  if (weight) style.fontWeight = weight
  return <span style={style}>{children}</span>
}
