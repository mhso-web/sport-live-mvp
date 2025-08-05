'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaEdit, FaPowerOff, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import UserEditModal from './UserEditModal'
import UserDetailModal from './UserDetailModal'
import Pagination from '@/components/common/Pagination'
import type { AdminUser } from '@/services/admin/adminUserService'

export default function UserManagementContent() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [orderBy, setOrderBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, statusFilter, orderBy, order, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        orderBy,
        order
      })

      if (search) params.append('search', search)
      if (roleFilter !== 'ALL') params.append('role', roleFilter)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.data.users)
      setTotalPages(data.data.pagination.totalPages)
      setTotal(data.data.pagination.total)
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (!confirm(`${user.username}님의 상태를 ${user.isActive ? '비활성화' : '활성화'}하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '상태 변경 실패')
      }

      // 목록 새로고침
      fetchUsers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrder('desc')
    }
    setCurrentPage(1)
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      ADMIN: { label: '최고관리자', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
      SUB_ADMIN: { label: '부관리자', className: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
      MODERATOR: { label: '운영자', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
      ANALYST: { label: '분석가', className: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
      USER: { label: '일반회원', className: 'bg-gray-500/20 text-gray-400 border-gray-500/50' }
    }

    const roleInfo = roleMap[role] || roleMap.USER
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${roleInfo.className}`}>
        {roleInfo.label}
      </span>
    )
  }

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-red-400' // 마스터
    if (level >= 15) return 'text-purple-400' // 다이아
    if (level >= 10) return 'text-yellow-400' // 골드
    if (level >= 5) return 'text-gray-300' // 실버
    return 'text-orange-400' // 브론즈
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">회원 관리</h1>
        <p className="text-gray-400">전체 회원 수: {total.toLocaleString()}명</p>
      </div>

      {/* 필터 */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="닉네임 또는 이메일 검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* 권한 필터 */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="ALL">모든 권한</option>
            <option value="USER">일반회원</option>
            <option value="ANALYST">분석가</option>
            <option value="MODERATOR">운영자</option>
            <option value="SUB_ADMIN">부관리자</option>
            <option value="ADMIN">최고관리자</option>
          </select>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="ALL">모든 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>

          {/* 정렬 */}
          <select
            value={`${orderBy}-${order}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-')
              setOrderBy(field)
              setOrder(direction as 'asc' | 'desc')
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="createdAt-desc">최근 가입순</option>
            <option value="createdAt-asc">오래된 가입순</option>
            <option value="username-asc">닉네임 오름차순</option>
            <option value="username-desc">닉네임 내림차순</option>
            <option value="level-desc">레벨 높은순</option>
            <option value="level-asc">레벨 낮은순</option>
            <option value="lastLoginAt-desc">최근 접속순</option>
          </select>
        </div>
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">닉네임</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">이메일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">권한</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">레벨</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">활동</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">가입일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">최근 접속</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <FaCheckCircle className="text-green-400" title="활성" />
                    ) : (
                      <FaTimesCircle className="text-red-400" title="비활성" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getLevelColor(user.level)}`}>
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${getLevelColor(user.level)}`}>
                      Lv.{user.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    <div>게시글 {user._count.posts}</div>
                    <div>댓글 {user._count.comments}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {format(new Date(user.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {user.lastLoginAt 
                      ? format(new Date(user.lastLoginAt), 'MM.dd HH:mm', { locale: ko })
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditModal(true)
                        }}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                        title="수정"
                      >
                        <FaEdit />
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 ${
                            user.isActive 
                              ? 'text-red-400 hover:bg-red-500/20' 
                              : 'text-green-400 hover:bg-green-500/20'
                          } rounded transition-colors`}
                          title={user.isActive ? '비활성화' : '활성화'}
                        >
                          <FaPowerOff />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDetailModal(true)
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-700 rounded transition-colors"
                        title="상세정보"
                      >
                        <FaInfoCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 사용자 수정 모달 */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedUser(null)
            fetchUsers()
          }}
        />
      )}

      {/* 사용자 상세 정보 모달 */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}