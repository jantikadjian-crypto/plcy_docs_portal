import { MDXProvider } from 'nextra/mdx'
import { mdxComponents } from '../components/mdx'
import '../styles/mdx.css'

// Makes the rich-authoring component kit (components/mdx/) available in every
// .mdx page with no per-file import. Nextra compiles MDX with a provider import
// source, so components in this MDXProvider resolve by name inside Markdown.
export default function App({ Component, pageProps }) {
  return (
    <MDXProvider components={mdxComponents}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}
