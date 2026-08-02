import { Fragment, type ReactNode } from 'react'

/**
 * Minimal Lexical renderer covering what the editor can produce in this
 * template: paragraphs, headings, lists, quotes, line breaks, links, and the
 * inline text formats. Unknown node types render their children rather than
 * disappearing.
 */

type LexicalNode = {
  type: string
  version?: number
  children?: LexicalNode[]
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  fields?: { url?: string; newTab?: boolean; linkType?: string }
  [key: string]: unknown
}

export type RichTextValue = {
  root: { children?: unknown[]; [key: string]: unknown }
  [key: string]: unknown
} | null | undefined

// Lexical text format bit flags.
const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4

function renderText(node: LexicalNode, key: string): ReactNode {
  const format = typeof node.format === 'number' ? node.format : 0
  let content: ReactNode = node.text ?? ''

  if (format & IS_CODE) {
    content = <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.9em]">{content}</code>
  }
  if (format & IS_BOLD) content = <strong>{content}</strong>
  if (format & IS_ITALIC) content = <em>{content}</em>
  if (format & IS_UNDERLINE) content = <u>{content}</u>
  if (format & IS_STRIKETHROUGH) content = <s>{content}</s>

  return <Fragment key={key}>{content}</Fragment>
}

function renderChildren(children: LexicalNode[] | undefined, keyPrefix: string): ReactNode {
  if (!children) return null

  return children.map((child, index) => renderNode(child, `${keyPrefix}-${index}`))
}

function renderNode(node: LexicalNode, key: string): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node, key)

    case 'linebreak':
      return <br key={key} />

    case 'paragraph': {
      const children = renderChildren(node.children, key)
      // Lexical emits empty paragraphs for blank lines; keep the spacing.
      return (
        <p key={key} className="mb-4 leading-relaxed last:mb-0">
          {node.children?.length ? children : ' '}
        </p>
      )
    }

    case 'heading': {
      const Tag = (node.tag ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      // Headings carry the display face; body copy stays in the UI face so the
      // contrast between the two does the work.
      const sizes: Record<string, string> = {
        h1: 'text-3xl leading-[1.05] sm:text-[2.75rem]',
        h2: 'text-2xl leading-[1.1] sm:text-[2rem]',
        h3: 'text-xl sm:text-2xl',
        h4: 'text-lg',
        h5: 'text-base',
        h6: 'text-sm',
      }

      return (
        <Tag
          key={key}
          className={`font-heading mt-8 mb-4 font-bold tracking-tight text-balance first:mt-0 ${sizes[Tag] ?? sizes.h2}`}
        >
          {renderChildren(node.children, key)}
        </Tag>
      )
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'

      return (
        <Tag
          key={key}
          className={`mb-4 ml-5 space-y-1 ${Tag === 'ol' ? 'list-decimal' : 'list-disc'}`}
        >
          {renderChildren(node.children, key)}
        </Tag>
      )
    }

    case 'listitem':
      return <li key={key}>{renderChildren(node.children, key)}</li>

    case 'quote':
      return (
        <blockquote
          key={key}
          className="mb-4 border-l-2 border-foreground/20 pl-4 text-foreground/80 italic"
        >
          {renderChildren(node.children, key)}
        </blockquote>
      )

    case 'horizontalrule':
      return <hr key={key} className="my-6 border-foreground/10" />

    case 'link':
    case 'autolink': {
      const url = node.fields?.url ?? '#'
      const newTab = node.fields?.newTab

      return (
        <a
          key={key}
          href={url}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
          className="underline underline-offset-2 transition-colors hover:text-foreground/70"
        >
          {renderChildren(node.children, key)}
        </a>
      )
    }

    default:
      return <Fragment key={key}>{renderChildren(node.children, key)}</Fragment>
  }
}

export function RichText({ value, className }: { value: RichTextValue; className?: string }) {
  const children = value?.root?.children as LexicalNode[] | undefined

  if (!children?.length) return null

  return <div className={className}>{renderChildren(children, 'rt')}</div>
}
