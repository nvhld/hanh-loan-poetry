'use client'

/**
 * IMPORTANT:
 * This layer preserves the atmospheric literary runtime.
 * Do NOT recreate runtime behavior in React.
 * React is infrastructure only.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  loadLiteraryRuntime,
  type LiteraryRouteContext,
  type LiteraryRuntimeEntry,
} from '@/runtime/literary-loader'

type Props = {
  entry: LiteraryRuntimeEntry
  routeContext?: LiteraryRouteContext
  children: ReactNode
}

export default function LiteraryRuntimeHost({ entry, routeContext, children }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [shellMode, setShellMode] = useState(false)

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    const staticMinimalDirectEntry =
      entry === 'reader'
      && Boolean(routeContext?.poemId)
      && params.get('runtime') === 'minimal'

    // Text earns first paint: forced minimal direct links stay as the SEO shell.
    if (staticMinimalDirectEntry) {
      setShellMode(true)
      const html = document.documentElement
      const body = document.body
      const prevHtmlOverflow = html.style.overflow
      const prevBodyOverflow = body.style.overflow
      html.style.overflow = 'auto'
      body.style.overflow = 'auto'
      return () => {
        active = false
        setShellMode(false)
        html.style.overflow = prevHtmlOverflow
        body.style.overflow = prevBodyOverflow
      }
    }

    setShellMode(false)
    loadLiteraryRuntime({ entry, routeContext }).catch((cause: unknown) => {
      if (!active) return
      const message = cause instanceof Error ? cause.message : 'Unknown literary runtime error'
      console.error('[HL Runtime]', message)
      setError(message)
    })
    return () => {
      active = false
    }
  }, [entry, routeContext?.canonicalPath, routeContext?.poemId, routeContext?.poemSlug, routeContext?.requestedSlug])

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#050508',
        color: '#dcdbe3',
        overflowY: shellMode ? 'visible' : 'hidden',
      }}
    >
      {children}
      {error ? (
        <p style={{ padding: '24px', fontFamily: 'Cormorant Garamond, serif' }}>
          Không thể tải bề mặt văn bản. {error}
        </p>
      ) : null}
    </main>
  )
}
