import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hạnh Loan — Thơ',
  description: 'Một trường hấp dẫn nơi ký ức, nhục cảm, thời gian và khoảng cách liên tục làm cong ánh sáng của nhau.',
  metadataBase: new URL('https://www.hanhloan.online'),
  openGraph: {
    title: 'Hạnh Loan — Thơ',
    description: 'Thơ Nguyễn Thị Hạnh Loan. Không phải website thơ. Một trường hấp dẫn cảm xúc.',
    url: 'https://www.hanhloan.online',
    siteName: 'Hạnh Loan',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hạnh Loan — Thơ',
    description: 'Thơ Nguyễn Thị Hạnh Loan.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Be+Vietnam+Pro:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
