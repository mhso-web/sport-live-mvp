'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
                href="/matches"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                경기
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                게시판
              </Link>
              <Link
                href="/analysis"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                AI 분석
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
                  <div className="absolute right-0 mt-2 w-48 bg-dark-700 border border-dark-600 rounded-md shadow-xl py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      프로필
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      설정
                    </Link>
                    <hr className="my-1 border-dark-600" />
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
              href="/matches"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
            >
              경기
            </Link>
            <Link
              href="/posts"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
            >
              게시판
            </Link>
            <Link
              href="/analysis"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
            >
              AI 분석
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
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                  >
                    프로필
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-dark-700 transition-colors duration-200"
                  >
                    설정
                  </Link>
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
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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