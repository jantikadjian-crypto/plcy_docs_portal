import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { loadIndex, search, tokenize, highlight } from '../lib/search'

function Marked({ text, terms }) {
  return (
    <>
      {highlight(text, terms).map(([chunk, hit], i) =>
        hit ? <mark key={i} className="plcy-hit">{chunk}</mark> : <span key={i}>{chunk}</span>
      )}
    </>
  )
}

// The full search results page behind /search?q=… — a shareable, bookmarkable
// URL that lists every match rather than the header dropdown's top few.
export default function SearchResults() {
  const router = useRouter()
  const [docs, setDocs] = useState(null)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    loadIndex().then(setDocs)
  }, [])

  // The URL is the source of truth for the query, so back/forward and a pasted
  // link both land on the same results.
  useEffect(() => {
    if (!router.isReady) return
    const q = typeof router.query.q === 'string' ? router.query.q : ''
    setQuery(q)
  }, [router.isReady, router.query.q])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo(
    () => (docs ? search(docs, query) : []),
    [docs, query]
  )
  const terms = useMemo(() => tokenize(query), [query])

  // Typing updates results immediately but only rewrites the URL (replace, so
  // it doesn't stack history entries per keystroke).
  function onChange(e) {
    const next = e.target.value
    setQuery(next)
    router.replace(
      { pathname: '/search', query: next ? { q: next } : {} },
      undefined,
      { shallow: true }
    )
  }

  return (
    <div className="plcy-search-page">
      <input
        ref={inputRef}
        type="search"
        className="plcy-search-input"
        value={query}
        onChange={onChange}
        placeholder="Search documentation…"
        aria-label="Search documentation"
        autoComplete="off"
      />

      <p className="plcy-search-count" role="status" aria-live="polite">
        {docs === null
          ? 'Loading index…'
          : !query.trim()
          ? 'Type to search the documentation.'
          : results.length === 0
          ? `No results for “${query}”.`
          : `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”.`}
      </p>

      {docs !== null && query.trim() && results.length === 0 && (
        <p className="plcy-search-empty">
          Try a broader term, or browse the <Link href="/">sections</Link> and{' '}
          <Link href="/glossary">glossary</Link>.
        </p>
      )}

      <ol className="plcy-results">
        {results.map(({ doc, snippet, headings }) => (
          <li key={doc.route} className="plcy-result">
            <div className="plcy-result-head">
              <Link href={doc.route} className="plcy-result-title">
                <Marked text={doc.title} terms={terms} />
              </Link>
              {doc.section && <span className="plcy-result-section">{doc.section}</span>}
            </div>

            <p className="plcy-result-snippet">
              <Marked text={snippet} terms={terms} />
            </p>

            {headings.length > 0 && (
              <ul className="plcy-result-headings">
                {headings.map(h => (
                  <li key={h.id}>
                    <Link href={`${doc.route}#${h.id}`}>
                      # <Marked text={h.text} terms={terms} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
