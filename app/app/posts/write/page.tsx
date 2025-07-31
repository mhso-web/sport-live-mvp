'use client'

import { Suspense } from 'react'
import PostWriteContent from './PostWriteContent'

export default function PostWritePage() {
  return (
    <Suspense fallback={
        <main className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </main>
      }>
        <PostWriteContent />
      </Suspense>
  )
}