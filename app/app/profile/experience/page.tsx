import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { redirect } from 'next/navigation'
import ExperienceHistory from './ExperienceHistory'

export const dynamic = 'force-dynamic'

export default async function ExperiencePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  return <ExperienceHistory />
}