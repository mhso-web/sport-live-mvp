'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  FaHome, 
  FaUsers, 
  FaBuilding, 
  FaNewspaper, 
  FaChartBar,
  FaQuestion,
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa'

interface AdminSidebarProps {
  userRole: string
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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

  // 모바일에서 메뉴 클릭 시 사이드바 닫기
  const handleMenuClick = () => {
    setIsSidebarOpen(false)
  }

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // 모바일에서 사이드바가 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  return (
    <>
      {/* 관리자 상단 헤더 (모바일용) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-yellow-400 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
          aria-label="메뉴 열기/닫기"
        >
          {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
        
        <h1 className="text-lg font-bold text-yellow-400">관리자 패널</h1>
        
        <Link
          href="/"
          className="p-2 text-gray-400 hover:text-yellow-400 rounded-lg transition-colors"
          title="홈으로 이동"
        >
          <FaHome className="w-5 h-5" />
        </Link>
      </div>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 min-h-screen bg-gray-900 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-yellow-400">관리자 패널</h2>
            <Link
              href="/"
              className="hidden lg:flex p-2 text-gray-400 hover:text-yellow-400 rounded-lg transition-colors"
              title="홈으로 이동"
            >
              <FaHome className="w-5 h-5" />
            </Link>
          </div>
          
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                             (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMenuClick}
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
    </>
  )
}