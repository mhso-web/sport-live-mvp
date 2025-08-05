import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { redirect } from 'next/navigation'
import UserManagementContent from '@/components/admin/users/UserManagementContent'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  // ADMIN만 접근 가능
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin')
  }

  return <UserManagementContent />
}