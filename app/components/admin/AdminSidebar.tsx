'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, 
  FaUsers, 
  FaBuilding, 
  FaNewspaper, 
  FaChartBar,
  FaQuestion,
  FaCog
} from 'react-icons/fa'

interface AdminSidebarProps {
  userRole: string
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  
  const menuItems = [
    {
      href: '/admin',
      label: '대시보드',
      icon: FaHome,
      roles: ['ADMIN', 'SUB_ADMIN']
    },
    {
      href: '/admin/users',
      label: '회원 관리',
      icon: FaUsers,
      roles: ['ADMIN']
    },
    {
      href: '/admin/partners',
      label: '보증업체 관리',
      icon: FaBuilding,
      roles: ['ADMIN', 'SUB_ADMIN']
    },
    {
      href: '/admin/posts',
      label: '게시글 관리',
      icon: FaNewspaper,
      roles: ['ADMIN', 'SUB_ADMIN', 'MODERATOR']
    },
    {
      href: '/admin/inquiries',
      label: '1:1 문의 관리',
      icon: FaQuestion,
      roles: ['ADMIN', 'SUB_ADMIN']
    },
    {
      href: '/admin/stats',
      label: '통계',
      icon: FaChartBar,
      roles: ['ADMIN']
    },
    {
      href: '/admin/settings',
      label: '시스템 설정',
      icon: FaCog,
      roles: ['ADMIN']
    }
  ]

  // 사용자 권한에 따라 메뉴 필터링
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800">
      <div className="p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-8">관리자 패널</h2>
        
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-yellow-500/20 text-yellow-400 border-l-4 border-yellow-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* 사용자 정보 */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <p className="text-sm text-gray-500">로그인 권한</p>
          <p className="text-yellow-400 font-medium">
            {userRole === 'ADMIN' ? '최고 관리자' : '부관리자'}
          </p>
        </div>
      </div>
    </aside>
  )
}