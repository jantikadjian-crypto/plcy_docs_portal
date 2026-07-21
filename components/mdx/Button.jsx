import React from 'react'
import Link from 'next/link'

// Call-to-action link styled as a button. Internal hrefs (starting with "/")
// route client-side via next/link; external ones open in a new tab.
export default function Button({ href = '#', variant = 'primary', children }) {
  const className = `plcy-button is-${variant}`
  const external = /^https?:\/\//.test(href)
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  )
}
