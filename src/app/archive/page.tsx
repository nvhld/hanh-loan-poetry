import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDateLabel, getAnchorEntries } from '@/runtime/anchor-reader'
import { getCanonicalPoems } from '@/runtime/literary-data'

export const metadata: Metadata = {
  title: 'Thư Viện Đêm — Hạnh Loan',
  description: 'Một thư viện đêm nơi các bài thơ được giữ theo trường cảm xúc và trình tự ký ức.',
  alternates: {
    canonical: '/archive',
  },
  openGraph: {
    title: 'Thư Viện Đêm — Hạnh Loan',
    description: 'Một thư viện đêm nơi các bài thơ được giữ theo trường cảm xúc và trình tự ký ức.',
    url: 'https://www.hanhloan.online/archive',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thư Viện Đêm — Hạnh Loan',
    description: 'Một thư viện đêm nơi các bài thơ được giữ theo trường cảm xúc và trình tự ký ức.',
    images: ['/og-image.jpg'],
  },
}

export default async function ArchivePage() {
  const poems = await getCanonicalPoems()
  const anchors = getAnchorEntries(poems)

  return (
    <main className="anchor-archive">
      <div className="anchor-room-ambient" aria-hidden="true" />
      <section className="anchor-archive-hero">
        <p>Hạnh Loan</p>
        <h1>12 bài anchor</h1>
        <span>
          Một tuyến đọc đã được khóa cho bản beta kín. Vào từng phòng, đọc trọn bài,
          rồi đi tiếp bằng dư âm của bài trước.
        </span>
      </section>

      <section className="anchor-archive-grid" aria-label="Danh sách 12 bài anchor">
        {anchors.map(({ poem, profile }) => (
          <Link
            className={`anchor-archive-card anchor-archive-card-${profile.tone}`}
            href={`/poem/${poem.slug}`}
            key={poem.id}
          >
            <span className="anchor-card-order">{String(profile.order).padStart(2, '0')}</span>
            <span className="anchor-card-field">{profile.fieldLabel}</span>
            <h2>{poem.title}</h2>
            <p>{poem.excerpt}</p>
            <small>{formatDateLabel(poem)}</small>
          </Link>
        ))}
      </section>
    </main>
  )
}
