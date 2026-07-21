import React from 'react'

// Multi-column layout that collapses to a single column on narrow screens.
// `count` sets the column target; children flow into equal tracks.
export function Columns({ count = 2, gap = '1.5rem', children }) {
  return (
    <div
      className="plcy-columns"
      style={{ '--plcy-cols': count, '--plcy-gap': gap }}
    >
      {children}
    </div>
  )
}

// One column cell. Optional; children of <Columns> can also be plain blocks.
export function Column({ children }) {
  return <div className="plcy-column">{children}</div>
}

// A bordered content card, optionally a link. Compose several inside <CardGrid>.
export function Card({ title, href, icon, children }) {
  const inner = (
    <>
      {icon ? <span className="plcy-card-icon" aria-hidden="true">{icon}</span> : null}
      {title ? <span className="plcy-card-title">{title}</span> : null}
      {children ? <span className="plcy-card-body">{children}</span> : null}
    </>
  )
  if (href) {
    return (
      <a className="plcy-card is-link" href={href}>
        {inner}
      </a>
    )
  }
  return <div className="plcy-card">{inner}</div>
}

// Responsive grid of Cards.
export function CardGrid({ min = '15rem', children }) {
  return (
    <div className="plcy-cardgrid" style={{ '--plcy-card-min': min }}>
      {children}
    </div>
  )
}
