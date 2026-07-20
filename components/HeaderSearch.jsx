import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { loadIndex, search, tokenize, highlight } from '../lib/search'

const MAX_PREVIEW = 5

function Marked({ text, terms }) {
  return (
    <>
      {highlight(text, terms).map(([chunk, hit], i) =>
        hit ? <mark key={i} className="plcy-hit">{chunk}</mark> : <span key={i}>{chunk}</span>
      )}
    </>
  )
}

// Replaces Nextra's built-in search box so the header and /search share one
// index and one ranking. Shows the top few hits inline; Enter (or "See all")
// hands off to the full results page.
export default function HeaderSearch({ className }) {
  const router = useRouter()
  const [docs, setDocs] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  // Enter means "see all results" until the reader has actually picked a hit
  // with the arrow keys or the mouse.
  const [picked, setPicked] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch the index on first focus rather than on mount — the header renders on
  // every page, but most visits never search.
  function ensureIndex() {
    if (docs === null) loadIndex().then(setDocs)
  }

  const results = useMemo(
    () => (docs ? search(docs, query, { limit: MAX_PREVIEW }) : []),
    [docs, query]
  )
  const terms = useMemo(() => tokenize(query), [query])
  const total = useMemo(
    () => (docs && query.trim() ? search(docs, query, { limit: 200 }).length : 0),
    [docs, query]
  )

  useEffect(() => {
    setActive(0)
    setPicked(false)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Cmd/Ctrl-K focuses search, matching the shortcut Nextra's own box used.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ensureIndex()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function go(route) {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    router.push(route)
  }

  function seeAll() {
    if (!query.trim()) return
    go(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setPicked(true)
      setActive(i => Math.min(i + 1, results.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setPicked(true)
      setActive(i => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      // A selected hit jumps straight to that page; a bare Enter opens the full
      // result list, which is the more forgiving default.
      if (open && picked && results[active]) go(results[active].doc.route)
      else seeAll()
    }
  }

  const showPanel = open && query.trim().length > 0

  return (
    <div ref={wrapRef} className={`plcy-hsearch ${className || ''}`}>
      <input
        ref={inputRef}
        type="search"
        className="plcy-hsearch-input"
        value={query}
        placeholder="Search documentation…"
        aria-label="Search documentation"
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="plcy-hsearch-list"
        onFocus={() => {
          ensureIndex()
          setOpen(true)
        }}
        onChange={e => {
          ensureIndex()
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />

      {showPanel && (
        <div className="plcy-hsearch-panel" id="plcy-hsearch-list" role="listbox">
          {docs === null ? (
            <div className="plcy-hsearch-empty">Loading…</div>
          ) : results.length === 0 ? (
            <div className="plcy-hsearch-empty">No results for “{query}”.</div>
          ) : (
            results.map(({ doc, snippet }, i) => (
              <button
                key={doc.route}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`plcy-hsearch-item ${i === active ? 'is-active' : ''}`}
                onMouseEnter={() => {
                  setActive(i)
                  setPicked(true)
                }}
                onClick={() => go(doc.route)}
              >
                <span className="plcy-hsearch-title">
                  <Marked text={doc.title} terms={terms} />
                  {doc.section && <span className="plcy-hsearch-section">{doc.section}</span>}
                </span>
                <span className="plcy-hsearch-snippet">
                  <Marked text={snippet} terms={terms} />
                </span>
              </button>
            ))
          )}

          {docs !== null && total > 0 && (
            <button type="button" className="plcy-hsearch-all" onClick={seeAll}>
              See all {total} result{total === 1 ? '' : 's'} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
