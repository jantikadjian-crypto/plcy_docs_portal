import React from 'react'

// Image with an optional caption and controllable width/alignment. `src` is a
// path under public/ (e.g. /diagrams/architecture.svg) or an absolute URL.
// Prefer this over a bare Markdown image when you need a caption or sizing.
export default function Figure({
  src,
  alt = '',
  caption,
  width,
  align = 'center', // 'left' | 'center' | 'right' | 'full'
  border = false,
}) {
  if (!src) return null
  const style = {}
  if (width) style.maxWidth = typeof width === 'number' ? `${width}px` : width
  return (
    <figure className={`plcy-figure is-${align}`} style={style}>
      <img src={src} alt={alt} className={border ? 'has-border' : undefined} loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
