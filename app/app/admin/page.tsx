import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import DashboardContent from '@/components/admin/dashboard/DashboardContent'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  return <DashboardContent userRole={session?.user?.role || ''} />
}