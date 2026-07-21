import React from 'react'

// Accepts either a bare video id, a full watch URL, a youtu.be link, or an
// embed/shorts URL — so an author can paste whatever they copied from YouTube.
function extractId(input = '') {
  const s = String(input).trim()
  if (/^[\w-]{11}$/.test(s)) return s // already a bare id
  try {
    const url = new URL(s)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1)
    if (url.searchParams.get('v')) return url.searchParams.get('v')
    const m = url.pathname.match(/\/(embed|shorts|v)\/([\w-]{11})/)
    if (m) return m[2]
  } catch {
    /* not a URL — fall through */
  }
  return s
}

// Responsive 16:9 YouTube embed. Uses the privacy-preserving nocookie host and
// only loads on interaction is out of scope here (Nextra pages are lightweight),
// but we keep it lazy so a page full of embeds doesn't block render.
export default function YouTube({ id, url, start, title = 'YouTube video', ratio = '16 / 9' }) {
  const videoId = extractId(id || url)
  if (!videoId) return null
  const params = new URLSearchParams({ rel: '0' })
  if (start) params.set('start', String(start))
  return (
    <span className="plcy-embed" style={{ aspectRatio: ratio }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </span>
  )
}
