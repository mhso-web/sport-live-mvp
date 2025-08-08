'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import LevelProgressBar from '@/components/ui/LevelProgressBar'
import { useUpdateSession } from '@/hooks/useUpdateSession'

interface BoardCategory {
  id: number
  slug: string
  name: string
  icon: string
  color: string
}

export default function Navigation() {
  const { data: session, status } = useSession()
  const { updateUserLevel } = useUpdateSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [boardCategories, setBoardCategories] = useState<BoardCategory[]>([])
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false)
  const boardMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchBoards()
    
    // 컴포넌트 마운트 시 최신 세션 정보 가져오기
    if (session?.user) {
      updateUserLevel()
    }
    
    return () => {
      if (boardMenuTimeoutRef.current) {
        clearTimeout(boardMenuTimeoutRef.current)
      }
    }
  }, [session?.user?.id])

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards?type=COMMUNITY')
      if (!response.ok) {
        console.error('Failed to fetch boards:', response.status)
        return
      }
      const data = await response.json()
      if (data.success) {
        setBoardCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error)
      // 기본 카테고리 설정 (API 실패 시)
      setBoardCategories([
        { id: 1, slug: 'general', name: '자유게시판', icon: '💬', color: '#60A5FA' },
        { id: 2, slug: 'soccer', name: '축구', icon: '⚽', color: '#34D399' },
        { id: 3, slug: 'baseball', name: '야구', icon: '⚾', color: '#F87171' },
        { id: 4, slug: 'basketball', name: '농구', icon: '🏀', color: '#FB923C' }
      ])
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient-gold">Sports Live</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/live"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                실시간 중계
              </Link>
              
              <Link
                href="/matches"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                경기
              </Link>
              
              {/* 게시판 드롭다운 */}
              <div 
                className="relative inline-flex items-center"
                onMouseEnter={() => {
                  if (boardMenuTimeoutRef.current) {
                    clearTimeout(boardMenuTimeoutRef.current)
                  }
                  setIsBoardMenuOpen(true)
                }}
                onMouseLeave={() => {
                  boardMenuTimeoutRef.current = setTimeout(() => {
                    setIsBoardMenuOpen(false)
                  }, 100)
                }}
              >
                <Link
                  href="/posts"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200 h-full"
                >
                  게시판
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {isBoardMenuOpen && boardCategories.length > 0 && (
                  <div className="absolute left-0 top-full pt-2 w-64 z-50">
                    <div className="bg-dark-700 border border-dark-600 rounded-md shadow-xl">
                      <div className="py-2">
                      {boardCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/posts/${category.slug}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                        >
                          <span 
                            className="mr-3 text-lg w-6 h-6 flex items-center justify-center rounded"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </span>
                          <span>{category.name}</span>
                        </Link>
                      ))}
                      <hr className="my-2 border-dark-600" />
                      <Link
                        href="/posts"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      >
                        <span className="mr-3 text-lg w-6 h-6 flex items-center justify-center">📋</span>
                        <span>전체 게시판</span>
                      </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Link
                href="/analysis"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                경기 분석
              </Link>
              
              <Link
                href="/partners"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                보증업체
              </Link>
              
              <Link
                href="/notice"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                공지사항
              </Link>
              
              <Link
                href="/support"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                고객센터
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-dark-600 rounded animate-pulse"></div>
              </div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <span>{session.user.name}</span>
                    <span className="text-xs bg-gold-900/30 text-gold-400 border border-gold-700/50 px-2 py-1 rounded-full">
                      Lv.{session.user.level}
                    </span>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-dark-700 border border-dark-600 rounded-md shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-dark-600">
                      <LevelProgressBar 
                        userId={parseInt(session.user.id)}
                        currentLevel={session.user.level}
                        currentExperience={session.user.experience || 0}
                      />
                    </div>
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      프로필
                    </Link>
                    <Link
                      href="/profile/my-activities"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 활동 내역
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      설정
                    </Link>
                    <hr className="my-1 border-dark-600" />
                    {['ADMIN', 'SUB_ADMIN'].includes(session.user.role) && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gold-400 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          관리자 패널
                        </Link>
                        <hr className="my-1 border-dark-600" />
                      </>
                    )}
                    <button
                      onClick={() => {
                        updateUserLevel()
                        window.location.reload()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                    >
                      경험치 새로고침
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-gold-500 text-sm font-medium transition-colors duration-200"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-gold hover:shadow-gold-500/20 hover:shadow-lg text-dark-900 font-semibold px-4 py-2 rounded-md text-sm transition-all duration-200"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-dark-800 border-t border-dark-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/live"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              실시간 중계
            </Link>
            
            <Link
              href="/matches"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              경기
            </Link>
            
            {/* 모바일 게시판 메뉴 */}
            <div>
              <Link
                href="/posts"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                게시판
              </Link>
              {boardCategories.length > 0 && (
                <div className="pl-6 space-y-1">
                  {boardCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/posts/${category.slug}`}
                      className="flex items-center py-2 pr-4 text-sm text-gray-400 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span 
                        className="mr-2 text-sm w-5 h-5 flex items-center justify-center rounded"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link
              href="/analysis"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              AI 분석
            </Link>
            
            <Link
              href="/partners"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              보증업체
            </Link>
            
            <Link
              href="/notice"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              공지사항
            </Link>
            
            <Link
              href="/support"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              고객센터
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-dark-600">
            {session ? (
              <>
                <div className="px-4 mb-3">
                  <div className="text-base font-medium text-gray-100">{session.user.name}</div>
                  <div className="text-sm font-medium text-gold-500">Level {session.user.level}</div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    프로필
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    설정
                  </Link>
                  {['ADMIN', 'SUB_ADMIN'].includes(session.user.role) && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-base font-medium text-gold-400 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      관리자 패널
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}