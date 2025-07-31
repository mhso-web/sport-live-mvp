import { Suspense } from 'react'
import PostListContent from './PostListContent'
import { prisma } from '@/lib/prisma'

// Dynamic route params generation for build time
export async function generateStaticParams() {
  try {
    const categories = await prisma.boardCategory.findMany({
      where: { boardType: 'COMMUNITY' },
      select: { slug: true }
    })
    
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return default categories if database is not available
    return [
      { slug: 'general' },
      { slug: 'soccer' },
      { slug: 'baseball' },
      { slug: 'basketball' },
    ]
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function BoardPostsPage() {
  return (
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
  )
}