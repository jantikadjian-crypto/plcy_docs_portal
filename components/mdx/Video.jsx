import React from 'react'

// Self-hosted / external video file (mp4, webm). For YouTube use <YouTube>.
// `src` is a path under public/ (e.g. /media/demo.mp4) or an absolute URL.
export default function Video({
  src,
  poster,
  caption,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  ratio = '16 / 9',
}) {
  if (!src) return null
  const video = (
    <span className="plcy-embed" style={{ aspectRatio: ratio }}>
      <video
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        // Browsers only allow autoplay when muted; enforce it so the page
        // doesn't silently fail to start.
        muted={autoPlay ? true : muted}
        playsInline
        preload={poster ? 'none' : 'metadata'}
      />
    </span>
  )
  if (!caption) return video
  return (
    <figure className="plcy-figure">
      {video}
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
