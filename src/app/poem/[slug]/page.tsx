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
      <article className="minimal-poem-shell">
        <div className="minimal-poem-titlebar" aria-hidden="true">
          <span>Hạnh Loan</span>
          <strong>{resolved.poem.title}</strong>
        </div>
        <section className="minimal-poem-page">
          <p className="minimal-poem-date">{resolved.poem.date || resolved.poem.year || ''}</p>
          <h1 className="minimal-poem-title">{resolved.poem.title}</h1>
          <div className="minimal-poem-body">{resolved.poem.body}</div>
        </section>
      </article>
    </LiteraryRuntimeHost>
  )
}
