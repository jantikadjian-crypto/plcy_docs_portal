// Maps the phase-1 rich MDX components (components/mdx/) onto Keystatic editor
// blocks, so authors insert <YouTube>, <Callout>, <Figure>, etc. from a toolbar
// and Keystatic serializes them back to the exact same MDX tags the site renders.
//
// The KEY of each entry is the MDX tag name — it must match the component name
// in components/mdx/index.js. Every component a doc might contain has to be
// declared here, or Keystatic can't parse that file. Kinds:
//   block     — void, own line (YouTube, Video, Figure)
//   wrapper   — block-level with child content (Callout, Lead, Column, Card)
//   repeating — wrapper whose children are a fixed component type (Columns, CardGrid)
//   mark      — inline, wraps selected text with styling (Color, Highlight, Font, Button, Badge)

import React from 'react'
import { fields } from '@keystatic/core'
import { block, wrapper, repeating, mark } from '@keystatic/core/content-components'

// Marks require an icon; a single neutral glyph keeps the toolbar consistent
// without pulling in an icon dependency.
const markIcon = (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M3 13 L6.5 3 H8.5 L12 13 H10 L9.2 10.6 H5.8 L5 13 Z M6.4 8.9 H8.6 L7.5 5.4 Z" fill="currentColor" />
  </svg>
)

export const docComponents = {
  // ---- Media (void blocks) ----
  YouTube: block({
    label: 'YouTube',
    schema: {
      url: fields.text({ label: 'YouTube URL or video ID' }),
      start: fields.text({ label: 'Start at (seconds, optional)' }),
    },
  }),

  Video: block({
    label: 'Video (self-hosted)',
    schema: {
      src: fields.text({ label: 'Source path or URL', validation: { isRequired: true } }),
      poster: fields.text({ label: 'Poster image (optional)' }),
      caption: fields.text({ label: 'Caption (optional)' }),
    },
  }),

  Figure: block({
    label: 'Image (with caption)',
    schema: {
      src: fields.text({ label: 'Image path or URL', validation: { isRequired: true } }),
      alt: fields.text({ label: 'Alt text' }),
      caption: fields.text({ label: 'Caption (optional)' }),
      align: fields.select({
        label: 'Alignment',
        options: [
          { label: 'Center', value: 'center' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
          { label: 'Full width', value: 'full' },
        ],
        defaultValue: 'center',
      }),
      border: fields.checkbox({ label: 'Show border', defaultValue: false }),
    },
  }),

  // ---- Admonitions & callouts (wrappers with child content) ----
  Callout: wrapper({
    label: 'Callout',
    schema: {
      type: fields.select({
        label: 'Type',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Tip', value: 'tip' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Danger', value: 'danger' },
          { label: 'Note', value: 'note' },
        ],
        defaultValue: 'info',
      }),
      title: fields.text({ label: 'Title (optional)' }),
    },
  }),

  Lead: wrapper({
    label: 'Lead paragraph',
    schema: {},
  }),

  // Block-level call-to-action link (used on its own line, wraps a text label).
  Button: wrapper({
    label: 'Button link',
    schema: {
      href: fields.text({ label: 'Link' }),
      variant: fields.select({
        label: 'Variant',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
        defaultValue: 'primary',
      }),
    },
  }),

  // ---- Layout ----
  Columns: repeating({
    label: 'Columns',
    children: ['Column'],
    schema: {
      count: fields.integer({ label: 'Column count', defaultValue: 2 }),
    },
  }),
  Column: wrapper({ label: 'Column', schema: {}, forSpecificLocations: true }),

  CardGrid: repeating({
    label: 'Card grid',
    children: ['Card'],
    schema: {
      min: fields.text({ label: 'Min card width', defaultValue: '15rem' }),
    },
  }),
  Card: wrapper({
    label: 'Card',
    schema: {
      title: fields.text({ label: 'Title' }),
      href: fields.text({ label: 'Link (optional)' }),
      icon: fields.text({ label: 'Icon (optional)' }),
    },
    forSpecificLocations: true,
  }),

  // ---- Inline marks (color / font / links / badges) ----
  Color: mark({
    label: 'Text color',
    icon: markIcon,
    schema: { value: fields.text({ label: 'CSS color (e.g. #1f6fd0)' }) },
    tag: 'span',
    style: ({ value }) => ({ color: value || 'inherit' }),
  }),

  Highlight: mark({
    label: 'Highlight',
    icon: markIcon,
    schema: { color: fields.text({ label: 'Highlight color', defaultValue: '#fef3c7' }) },
    tag: 'mark',
    style: ({ color }) => ({ background: color || '#fef3c7' }),
  }),

  Font: mark({
    label: 'Font',
    icon: markIcon,
    schema: {
      family: fields.text({ label: 'Font family (optional)' }),
      size: fields.text({ label: 'Size (optional)' }),
      weight: fields.text({ label: 'Weight (optional)' }),
    },
    tag: 'span',
    style: ({ family, size, weight }) => ({
      ...(family ? { fontFamily: family } : {}),
      ...(size ? { fontSize: size } : {}),
      ...(weight ? { fontWeight: weight } : {}),
    }),
  }),

  Badge: mark({
    label: 'Badge',
    icon: markIcon,
    schema: {
      tone: fields.select({
        label: 'Tone',
        options: [
          { label: 'Neutral', value: 'neutral' },
          { label: 'Blue', value: 'blue' },
          { label: 'Green', value: 'green' },
          { label: 'Amber', value: 'amber' },
          { label: 'Red', value: 'red' },
        ],
        defaultValue: 'neutral',
      }),
    },
    tag: 'span',
  }),
}
