import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import Link from 'next/link'
import { FaUsers, FaBuilding, FaNewspaper, FaChartBar } from 'react-icons/fa'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">관리자 대시보드</h1>
        <p className="text-gray-400">
          {session?.user?.role === 'ADMIN' ? '최고 관리자' : '부관리자'}님, 환영합니다.
        </p>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/users" className="block">
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-800">
              <FaUsers className="text-3xl text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">회원 관리</h3>
              <p className="text-sm text-gray-400">회원 정보 및 권한 관리</p>
            </div>
          </Link>
        )}

        <Link href="/admin/partners" className="block">
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-800">
            <FaBuilding className="text-3xl text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">보증업체 관리</h3>
            <p className="text-sm text-gray-400">보증업체 등록 및 관리</p>
          </div>
        </Link>

        <Link href="/admin/posts" className="block">
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-800">
            <FaNewspaper className="text-3xl text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">게시글 관리</h3>
            <p className="text-sm text-gray-400">게시글 및 댓글 관리</p>
          </div>
        </Link>

        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/stats" className="block">
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-800">
              <FaChartBar className="text-3xl text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">통계</h3>
              <p className="text-sm text-gray-400">사이트 통계 및 분석</p>
            </div>
          </Link>
        )}
      </div>

      {/* 최근 활동 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">최근 가입 회원</h2>
          <p className="text-gray-400">최근 가입한 회원 목록이 표시됩니다.</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">최근 게시글</h2>
          <p className="text-gray-400">최근 작성된 게시글 목록이 표시됩니다.</p>
        </div>
      </div>
    </div>
  )
}