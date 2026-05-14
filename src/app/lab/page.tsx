import type { Metadata } from 'next'
import LiteraryRuntimeHost from '@/runtime/LiteraryRuntimeHost'

export const metadata: Metadata = {
  title: 'Topology Lab — Hạnh Loan',
  description: 'Bản đồ trường lực nơi các bài thơ giữ khoảng cách, trọng lượng và vùng cộng hưởng của chúng.',
  alternates: {
    canonical: '/lab',
  },
  openGraph: {
    title: 'Topology Lab — Hạnh Loan',
    description: 'Bản đồ trường lực nơi các bài thơ giữ khoảng cách, trọng lượng và vùng cộng hưởng của chúng.',
    url: 'https://www.hanhloan.online/lab',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Topology Lab — Hạnh Loan',
    description: 'Bản đồ trường lực nơi các bài thơ giữ khoảng cách, trọng lượng và vùng cộng hưởng của chúng.',
    images: ['/og-image.jpg'],
  },
}

export default function LabPage() {
  return (
    <LiteraryRuntimeHost entry="lab" routeContext={{ canonicalPath: '/lab' }}>
      <section style={{ padding: '12dvh 24px 8dvh', maxWidth: 720 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 400 }}>
          Topology Lab
        </h1>
      </section>
    </LiteraryRuntimeHost>
  )
}
