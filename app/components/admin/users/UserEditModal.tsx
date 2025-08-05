'use client'

import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import type { AdminUser } from '@/services/admin/adminUserService'

interface UserEditModalProps {
  user: AdminUser
  onClose: () => void
  onSuccess: () => void
}

export default function UserEditModal({ user, onClose, onSuccess }: UserEditModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [loading, setLoading] = useState(false)

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, loading])

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      alert('변경사항이 없습니다.')
      return
    }

    if (!confirm(`${user.username}님의 권한을 변경하시겠습니까?`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '권한 변경 실패')
      }

      alert('권한이 성공적으로 변경되었습니다.')
      onSuccess()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoleOptions = () => {
    // ADMIN은 변경 불가
    if (user.role === 'ADMIN') {
      return []
    }

    return [
      { value: 'USER', label: '일반회원' },
      { value: 'ANALYST', label: '분석가' },
      { value: 'MODERATOR', label: '운영자' },
      { value: 'SUB_ADMIN', label: '부관리자' },
      { value: 'ADMIN', label: '최고관리자' }
    ]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">회원 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">기본 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">닉네임</span>
                <span className="text-white font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">이메일</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">레벨</span>
                <span className="text-yellow-400 font-medium">Lv.{user.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">경험치</span>
                <span className="text-white">{user.experience.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 활동 정보 */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">활동 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">게시글 수</span>
                <span className="text-white">{user._count.posts}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">댓글 수</span>
                <span className="text-white">{user._count.comments}개</span>
              </div>
            </div>
          </div>

          {/* 권한 변경 */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">권한 변경</h3>
            {user.role === 'ADMIN' ? (
              <p className="text-sm text-gray-500">최고 관리자의 권한은 변경할 수 없습니다.</p>
            ) : (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                disabled={loading}
              >
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            취소
          </button>
          {user.role !== 'ADMIN' && (
            <button
              onClick={handleUpdateRole}
              className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || selectedRole === user.role}
            >
              {loading ? '처리 중...' : '변경하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}