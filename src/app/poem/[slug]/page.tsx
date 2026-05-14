import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LiteraryRuntimeHost from '@/runtime/LiteraryRuntimeHost'
import {
  buildPoemDescription,
  getCanonicalPoems,
  resolvePoemRoute,
} from '@/runtime/literary-data'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const poems = await getCanonicalPoems()
  return poems.map((poem) => ({ slug: poem.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolvePoemRoute(slug)
  if (!resolved) {
    return {
      title: 'Không tìm thấy bài thơ — Hạnh Loan',
      robots: { index: false, follow: false },
    }
  }

  const description = buildPoemDescription(resolved.poem)
  return {
    title: `${resolved.poem.title} — Hạnh Loan`,
    description,
    alternates: {
      canonical: resolved.canonicalPath,
    },
    openGraph: {
      title: `${resolved.poem.title} — Hạnh Loan`,
      description,
      url: `https://www.hanhloan.online${resolved.canonicalPath}`,
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resolved.poem.title} — Hạnh Loan`,
      description,
      images: ['/og-image.jpg'],
    },
  }
}

export default async function PoemPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = await resolvePoemRoute(slug)
  if (!resolved) {
    redirect(`/archive?missing=${encodeURIComponent(slug)}`)
  }

  return (
    <LiteraryRuntimeHost
      entry="reader"
      routeContext={{
        poemId: resolved.poem.id,
        poemSlug: resolved.poem.slug,
        requestedSlug: resolved.requestedSlug,
        canonicalPath: resolved.canonicalPath,
      }}
    >
      <article style={{ maxWidth: 720, padding: '12dvh 24px 8dvh', margin: '0 auto', fontFamily: 'Cormorant Garamond, serif' }}>
        <p style={{ opacity: 0.5, marginBottom: 12 }}>{resolved.poem.date || resolved.poem.year || ''}</p>
        <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 400, lineHeight: 1.04, marginBottom: 24 }}>
          {resolved.poem.title}
        </h1>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.7 }}>
          {resolved.poem.body}
        </div>
      </article>
    </LiteraryRuntimeHost>
  )
}
