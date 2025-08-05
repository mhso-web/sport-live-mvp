'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaUsers, FaBuilding, FaNewspaper, FaChartBar, FaArrowUp, FaArrowDown, FaEye, FaHeart, FaComment } from 'react-icons/fa'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import type { DashboardStats, RecentUser, RecentPost, DailyStats } from '@/services/admin/adminStatsService'

// Chart.js 동적 임포트 (SSR 방지)
const DailyStatsChart = dynamic(
  () => import('./DailyStatsChart'),
  { ssr: false }
)

interface DashboardContentProps {
  userRole: string
}

export default function DashboardContent({ userRole }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, postsRes, dailyRes] = await Promise.all([
        fetch('/api/admin/stats?type=dashboard'),
        fetch('/api/admin/stats?type=recent-users'),
        fetch('/api/admin/stats?type=recent-posts'),
        fetch('/api/admin/stats?type=daily-stats')
      ])

      if (!statsRes.ok || !usersRes.ok || !postsRes.ok || !dailyRes.ok) {
        throw new Error('데이터 로딩 실패')
      }

      const [statsData, usersData, postsData, dailyData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        postsRes.json(),
        dailyRes.json()
      ])

      setStats(statsData.data)
      setRecentUsers(usersData.data)
      setRecentPosts(postsData.data)
      setDailyStats(dailyData.data)
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400 py-12">
        데이터를 불러올 수 없습니다.
      </div>
    )
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  const formatPercent = (num: number, total: number) => {
    if (total === 0) return '0%'
    return `${((num / total) * 100).toFixed(1)}%`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">관리자 대시보드</h1>
        <p className="text-gray-400">
          {userRole === 'ADMIN' ? '최고 관리자' : '부관리자'}님, 환영합니다.
        </p>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
            {stats.users.todayNew > 0 && (
              <span className="flex items-center text-green-400 text-sm">
                <FaArrowUp className="mr-1" />
                +{stats.users.todayNew}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white">{formatNumber(stats.users.total)}</h3>
          <p className="text-gray-400 text-sm">전체 회원</p>
          <p className="text-gray-500 text-xs mt-2">
            활성: {formatNumber(stats.users.activeCount)} ({formatPercent(stats.users.activeCount, stats.users.total)})
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FaNewspaper className="text-2xl text-green-400" />
            </div>
            {stats.posts.todayNew > 0 && (
              <span className="flex items-center text-green-400 text-sm">
                <FaArrowUp className="mr-1" />
                +{stats.posts.todayNew}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white">{formatNumber(stats.posts.total)}</h3>
          <p className="text-gray-400 text-sm">전체 게시글</p>
          <p className="text-gray-500 text-xs mt-2">
            오늘 작성: {stats.posts.todayNew}개
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <FaBuilding className="text-2xl text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-sm">
              ⭐ {stats.partners.avgRating.toFixed(1)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatNumber(stats.partners.total)}</h3>
          <p className="text-gray-400 text-sm">보증업체</p>
          <p className="text-gray-500 text-xs mt-2">
            활성: {formatNumber(stats.partners.activeCount)} ({formatPercent(stats.partners.activeCount, stats.partners.total)})
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FaChartBar className="text-2xl text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatNumber(stats.activities.todayLogins)}</h3>
          <p className="text-gray-400 text-sm">오늘 활동</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span className="flex items-center">
              <FaComment className="mr-1" />
              {stats.activities.todayComments}
            </span>
            <span className="flex items-center">
              <FaHeart className="mr-1" />
              {stats.activities.todayLikes}
            </span>
          </div>
        </div>
      </div>

      {/* 일별 통계 차트 */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">일별 통계 (최근 7일)</h2>
        <div className="h-64">
          <DailyStatsChart data={dailyStats} />
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 가입 회원 */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">최근 가입 회원</h2>
            {userRole === 'ADMIN' && (
              <Link href="/admin/users" className="text-yellow-400 hover:text-yellow-300 text-sm">
                전체보기 →
              </Link>
            )}
          </div>
          
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{user.nickname}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                        Lv.{user.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {format(new Date(user.createdAt), 'MM.dd HH:mm', { locale: ko })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'ADMIN' ? '관리자' : user.role === 'SUB_ADMIN' ? '부관리자' : '일반회원'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">최근 가입한 회원이 없습니다.</p>
          )}
        </div>

        {/* 최근 게시글 */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">최근 게시글</h2>
            <Link href="/admin/posts" className="text-yellow-400 hover:text-yellow-300 text-sm">
              전체보기 →
            </Link>
          </div>
          
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate pr-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{post.authorNickname}</span>
                        <span className="text-gray-600">|</span>
                        <span>{post.categoryName}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400 flex-shrink-0">
                      <p>{format(new Date(post.createdAt), 'MM.dd HH:mm', { locale: ko })}</p>
                      <p className="flex items-center justify-end gap-1 mt-1">
                        <FaEye className="w-3 h-3" />
                        {post.viewCount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">최근 작성된 게시글이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {userRole === 'ADMIN' && (
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

        {userRole === 'ADMIN' && (
          <Link href="/admin/stats" className="block">
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-800">
              <FaChartBar className="text-3xl text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">통계</h3>
              <p className="text-sm text-gray-400">사이트 통계 및 분석</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}