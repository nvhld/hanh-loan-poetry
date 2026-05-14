import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LiteraryRuntimeHost from '@/runtime/LiteraryRuntimeHost'
import {
  formatDateLabel,
  getAnchorEntries,
  getAnchorNavigation,
  getAnchorProfile,
  protectVietnameseOrphan,
  splitBodyIntoStanzas,
  type AnchorEntry,
  type AnchorProfile,
} from '@/runtime/anchor-reader'
import {
  buildPoemDescription,
  type CanonicalPoem,
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

  const anchorProfile = getAnchorProfile(resolved.poem)
  if (anchorProfile) {
    const poems = await getCanonicalPoems()
    const anchorEntries = getAnchorEntries(poems)
    const navigation = getAnchorNavigation(anchorEntries, anchorProfile)
    return (
      <AnchorReadingRoom
        poem={resolved.poem}
        profile={anchorProfile}
        previous={navigation.previous}
        next={navigation.next}
      />
    )
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

function AnchorReadingRoom({
  poem,
  profile,
  previous,
  next,
}: {
  poem: CanonicalPoem
  profile: AnchorProfile
  previous: AnchorEntry | null
  next: AnchorEntry | null
}) {
  const stanzas = splitBodyIntoStanzas(poem.body)
  const dateLabel = formatDateLabel(poem)
  return (
    <main className={`anchor-room anchor-room-${profile.tone} anchor-room-width-${profile.width}`}>
      <div className="anchor-room-ambient" aria-hidden="true" />
      <aside className="anchor-presence-rail" aria-label="Bài thơ đang đọc">
        <Link className="anchor-rail-mark" href="/archive" aria-label="Về 12 bài anchor">
          Hạnh Loan
        </Link>
        <div className="anchor-rail-current">
          <span>{String(profile.order).padStart(2, '0')}</span>
          <strong>{poem.title}</strong>
        </div>
        <span className="anchor-rail-field">{profile.fieldLabel}</span>
      </aside>

      <article className="anchor-reading-surface">
        <header className="anchor-arrival">
          <p className="anchor-date">{dateLabel}</p>
          <h1>{poem.title}</h1>
          <p className="anchor-room-note">{profile.roomNote}</p>
        </header>

        <div className="anchor-poem-text" aria-label={`Bài thơ ${poem.title}`}>
          {stanzas.map((stanza, stanzaIndex) => (
            <p className="anchor-stanza" key={`${poem.id}-stanza-${stanzaIndex}`}>
              {stanza.map((line, lineIndex) => (
                <span className="anchor-poem-line" key={`${poem.id}-${stanzaIndex}-${lineIndex}`}>
                  {protectVietnameseOrphan(line)}
                </span>
              ))}
            </p>
          ))}
        </div>

        <footer className="anchor-exit-trace">
          <p>{profile.residue}</p>
          <nav className="anchor-residue-nav" aria-label="Đi tiếp trong 12 bài anchor">
            {previous ? (
              <Link href={`/poem/${previous.poem.slug}`} className="anchor-nav-card anchor-nav-prev">
                <span>Bài trước</span>
                <strong>{previous.poem.title}</strong>
              </Link>
            ) : null}
            <Link href="/archive" className="anchor-nav-card anchor-nav-archive">
              <span>Trở về</span>
              <strong>12 bài anchor</strong>
            </Link>
            {next ? (
              <Link href={`/poem/${next.poem.slug}`} className="anchor-nav-card anchor-nav-next">
                <span>Bài sau</span>
                <strong>{next.poem.title}</strong>
              </Link>
            ) : null}
          </nav>
        </footer>
      </article>
    </main>
  )
}
