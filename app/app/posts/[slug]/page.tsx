import { Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
import PostListContent from './PostListContent'

export default function BoardPostsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <Suspense 
          fallback={
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          }
        >
          <PostListContent />
        </Suspense>
      </main>
    </>
  )
}