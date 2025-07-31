import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserService } from '@/lib/services/userService'
import { UserRepository } from '@/lib/repositories/userRepository'
import { ExperienceService } from '@/lib/services/experienceService'
import ProfileEditContent from './ProfileEditContent'

export const dynamic = 'force-dynamic'

const userRepository = new UserRepository()
const experienceService = new ExperienceService()
const userService = new UserService(userRepository, experienceService)

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const user = await userService.getUserById(userId)
  
  if (!user) {
    redirect('/login')
  }

  return <ProfileEditContent user={user} />
}