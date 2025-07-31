import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserService } from '@/lib/services/userService'
import { UserRepository } from '@/lib/repositories/userRepository'
import { ExperienceService } from '@/lib/services/experienceService'
import ProfileContent from './ProfileContent'

export const dynamic = 'force-dynamic'

const userRepository = new UserRepository()
const experienceService = new ExperienceService()
const userService = new UserService(userRepository, experienceService)

interface Props {
  params: { id: string }
}

export default async function ProfilePage({ params }: Props) {
  const userId = parseInt(params.id)
  
  if (isNaN(userId)) {
    notFound()
  }

  const profile = await userService.getUserProfile(userId)
  
  if (!profile) {
    notFound()
  }

  const session = await getServerSession(authOptions)
  const isOwnProfile = session?.user?.id === params.id

  return <ProfileContent profile={profile} isOwnProfile={isOwnProfile} />
}