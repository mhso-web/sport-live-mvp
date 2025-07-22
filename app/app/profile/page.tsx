import { requireAuth } from '@/lib/utils/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await requireAuth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-premium p-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">프로필</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">사용자명</label>
              <p className="mt-1 text-lg text-gray-100">{session.user.name}</p>
            </div>
            
            {session.user.email && (
              <div>
                <label className="block text-sm font-medium text-gray-400">이메일</label>
                <p className="mt-1 text-lg text-gray-100">{session.user.email}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-400">레벨</label>
              <p className="mt-1 text-lg text-gold-500 font-semibold">Level {session.user.level}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400">경험치</label>
              <div className="mt-1">
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-100">{session.user.experience} XP</span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-gradient-gold h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(session.user.experience % 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}