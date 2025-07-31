import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserRepository } from '@/lib/repositories/userRepository'
import MyActivitiesContent from './MyActivitiesContent'

export const dynamic = 'force-dynamic'

const userRepository = new UserRepository()

interface Props {
  searchParams: { tab?: string; page?: string }
}

export default async function MyActivitiesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const currentPage = parseInt(searchParams.page || '1')
  const activeTab = searchParams.tab || 'posts'
  const itemsPerPage = 10

  if (activeTab === 'posts') {
    const posts = await userRepository.getRecentPosts(userId, itemsPerPage * currentPage)
    const stats = await userRepository.getUserStats(userId)
    
    return (
      <MyActivitiesContent
        posts={posts}
        comments={[]}
        stats={stats}
        activeTab="posts"
        currentPage={currentPage}
        totalPages={Math.ceil(stats.postCount / itemsPerPage)}
      />
    )
  } else {
    const comments = await userRepository.getRecentComments(userId, itemsPerPage * currentPage)
    const stats = await userRepository.getUserStats(userId)
    
    return (
      <MyActivitiesContent
        posts={[]}
        comments={comments}
        stats={stats}
        activeTab="comments"
        currentPage={currentPage}
        totalPages={Math.ceil(stats.commentCount / itemsPerPage)}
      />
    )
  }
}