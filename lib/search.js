// Client-side query engine over public/search-index.json.
//
// Shared by the header search box (top few hits) and the /search results page
// (full ranked list), so both rank identically and a dropdown hit is always the
// same page as the corresponding row on /search.

// The index is small enough to fetch once and keep for the session.
let cache = null
let inflight = null

export function loadIndex() {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch('/search-index.json')
      .then(r => r.json())
      .then(data => {
        cache = data.docs || []
        return cache
      })
      .catch(() => {
        inflight = null
        return []
      })
  }
  return inflight
}

export function tokenize(query) {
  return query
    .toLowerCase()
    .split(/[^\w]+/)
    .filter(t => t.length > 1)
}

// Field weights: a term in the title beats one in a heading, which beats one
// buried in body prose. Body hits also scale (lightly) with frequency so a page
// that is *about* the term outranks one that mentions it once in passing.
const WEIGHT_TITLE = 40
const WEIGHT_TAG = 18
const WEIGHT_HEADING = 12
const WEIGHT_SECTION = 6
const WEIGHT_BODY = 3
const BODY_FREQ_CAP = 5

function countOccurrences(haystack, term) {
  let n = 0
  let i = haystack.indexOf(term)
  while (i !== -1) {
    n++
    i = haystack.indexOf(term, i + term.length)
  }
  return n
}

function scoreDoc(doc, terms, rawQuery) {
  const title = (doc.title + ' ' + (doc.navTitle || '')).toLowerCase()
  const tags = doc.tags.join(' ').toLowerCase()
  const headingText = doc.headings.map(h => h.text).join(' ').toLowerCase()
  const section = ((doc.section || '') + ' ' + (doc.category || '')).toLowerCase()
  const body = doc.text.toLowerCase()

  let score = 0
  let matchedAll = true

  for (const term of terms) {
    let termScore = 0
    if (title.includes(term)) termScore += WEIGHT_TITLE
    if (tags.includes(term)) termScore += WEIGHT_TAG
    if (headingText.includes(term)) termScore += WEIGHT_HEADING
    if (section.includes(term)) termScore += WEIGHT_SECTION
    const bodyHits = countOccurrences(body, term)
    if (bodyHits) termScore += WEIGHT_BODY * Math.min(bodyHits, BODY_FREQ_CAP)
    if (termScore === 0) matchedAll = false
    score += termScore
  }

  // Require every term to appear somewhere — otherwise a two-word query returns
  // everything that matches only its most common word.
  if (!matchedAll || score === 0) return 0

  // The whole query appearing verbatim is a much stronger signal than the same
  // words scattered across the page.
  const phrase = rawQuery.trim().toLowerCase()
  if (terms.length > 1) {
    if (title.includes(phrase)) score += WEIGHT_TITLE
    else if (body.includes(phrase)) score += WEIGHT_TITLE / 2
  }

  return score
}

// Pull the sentence-ish window around the first match so the reader can tell
// why a page matched without opening it.
function buildSnippet(doc, terms, radius = 90) {
  const body = doc.text
  const lower = body.toLowerCase()
  let at = -1
  for (const term of terms) {
    const i = lower.indexOf(term)
    if (i !== -1 && (at === -1 || i < at)) at = i
  }
  if (at === -1) return body.slice(0, radius * 2).trim()

  let start = Math.max(0, at - radius)
  let end = Math.min(body.length, at + radius)
  // Avoid cutting mid-word at either edge.
  if (start > 0) {
    const sp = body.indexOf(' ', start)
    if (sp !== -1 && sp < at) start = sp + 1
  }
  if (end < body.length) {
    const sp = body.lastIndexOf(' ', end)
    if (sp > at) end = sp
  }
  return (start > 0 ? '…' : '') + body.slice(start, end).trim() + (end < body.length ? '…' : '')
}

// Headings whose text matches give the result row deep links into the page.
function matchingHeadings(doc, terms, limit = 3) {
  return doc.headings
    .filter(h => {
      const t = h.text.toLowerCase()
      return terms.some(term => t.includes(term))
    })
    .slice(0, limit)
}

export function search(docs, query, { limit = 50 } = {}) {
  const terms = tokenize(query)
  if (!terms.length) return []

  const results = []
  for (const doc of docs) {
    const score = scoreDoc(doc, terms, query)
    if (!score) continue
    results.push({
      doc,
      score,
      snippet: buildSnippet(doc, terms),
      headings: matchingHeadings(doc, terms),
    })
  }

  results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
  return results.slice(0, limit)
}

// Split text into [text, isMatch] runs so callers can wrap matches in <mark>
// without ever injecting HTML from the index.
export function highlight(text, terms) {
  if (!terms.length) return [[text, false]]
  const escaped = terms
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${escaped.join('|')})`, 'ig')
  const out = []
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push([text.slice(last, m.index), false])
    out.push([m[0], true])
    last = m.index + m[0].length
  }
  if (last < text.length) out.push([text.slice(last), false])
  return out
}
