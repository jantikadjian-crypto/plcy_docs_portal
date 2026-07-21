// The rich-authoring component kit, exposed to every .mdx file with no import.
//
// This map is handed to <MDXProvider> in pages/_app.jsx, so authors write
// <YouTube …/>, <Callout …/>, <Columns>… etc. directly in Markdown. When you
// add a component here it becomes available site-wide automatically.
//
// The visual editor (phase 2) will insert these same tags, so this map is the
// single source of truth for "what can go in a document".

import YouTube from './YouTube'
import Video from './Video'
import Figure from './Figure'
import Callout from './Callout'
import Button from './Button'
import Badge from './Badge'
import { Color, Highlight, Lead, Font } from './Text'
import { Columns, Column, Card, CardGrid } from './Layout'

export const mdxComponents = {
  YouTube,
  Video,
  Figure,
  Callout,
  Button,
  Badge,
  Color,
  Highlight,
  Lead,
  Font,
  Columns,
  Column,
  Card,
  CardGrid,
}
