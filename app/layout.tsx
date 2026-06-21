import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Evico agency | وكالة إبداعية',
  description:
    'وكالة إبداعية متكاملة — ذكاء. إبداعي. | A full-service creative agency — Creative. Intelligence.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Evico agency | وكالة إبداعية',
    description: 'وكالة إبداعية متكاملة — ذكاء. إبداعي. | A full-service creative agency — Creative. Intelligence.',
    siteName: 'Evico agency',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@evico_sa',
    title: 'Evico agency | وكالة إبداعية',
    description: 'وكالة إبداعية متكاملة — ذكاء. إبداعي. | A full-service creative agency — Creative. Intelligence.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#111827',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
