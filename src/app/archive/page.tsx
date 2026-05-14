import type { Metadata } from 'next'
import LiteraryRuntimeHost from '@/runtime/LiteraryRuntimeHost'

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

export default function ArchivePage() {
  return (
    <LiteraryRuntimeHost entry="archive" routeContext={{ canonicalPath: '/archive' }}>
      <section style={{ padding: '12dvh 24px 8dvh', maxWidth: 720 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 400 }}>
          Thư Viện Đêm
        </h1>
      </section>
    </LiteraryRuntimeHost>
  )
}
