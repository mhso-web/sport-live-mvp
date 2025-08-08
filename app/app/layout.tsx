import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import ConditionalNavigation from '@/components/layout/ConditionalNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sports Live - 실시간 스포츠 중계 및 경기 분석',
  description: '실시간 스포츠 중계와 심층 경기 분석을 제공하는 스포츠 커뮤니티 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <SessionProvider>
          <ConditionalNavigation />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}