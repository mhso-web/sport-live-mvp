import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // 권한 확인
  if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        {/* 관리자 사이드바 */}
        <AdminSidebar userRole={session.user.role} />
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}