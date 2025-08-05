'use client'

import { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { AdminUser } from '@/services/admin/adminUserService'

interface UserDetailModalProps {
  user: AdminUser
  onClose: () => void
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      ADMIN: { label: '최고관리자', color: 'bg-red-500' },
      SUB_ADMIN: { label: '부관리자', color: 'bg-orange-500' },
      MODERATOR: { label: '운영자', color: 'bg-yellow-500' },
      ANALYST: { label: '분석가', color: 'bg-blue-500' },
      USER: { label: '일반회원', color: 'bg-gray-500' }
    }
    const roleInfo = roleMap[role] || { label: role, color: 'bg-gray-500' }
    return (
      <span className={`px-2 py-1 text-xs rounded ${roleInfo.color} text-white`}>
        {roleInfo.label}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs rounded bg-green-500 text-white">활성</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded bg-red-500 text-white">비활성</span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">회원 상세 정보</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">닉네임</p>
                  <p className="text-white font-medium">{user.username}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">이메일</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">권한</p>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">상태</p>
                  <div className="mt-1">{getStatusBadge(user.isActive)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">레벨</p>
                  <p className="text-yellow-400 font-medium">Lv.{user.level}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">경험치</p>
                  <p className="text-white">{user.experience.toLocaleString()} XP</p>
                </div>
              </div>
            </div>

            {/* 활동 통계 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">활동 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">작성한 게시글</p>
                  <p className="text-2xl font-bold text-white">{user._count.posts}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">작성한 댓글</p>
                  <p className="text-2xl font-bold text-white">{user._count.comments}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">총 활동</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {user._count.posts + user._count.comments}
                  </p>
                </div>
              </div>
            </div>

            {/* 시간 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">시간 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">가입일</span>
                  <span className="text-white">
                    {format(new Date(user.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">마지막 로그인</span>
                  <span className="text-white">
                    {user.lastLoginAt 
                      ? format(new Date(user.lastLoginAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
                      : '로그인 기록 없음'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">정보 수정일</span>
                  <span className="text-white">
                    {format(new Date(user.updatedAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </span>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            {user.bio && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">자기소개</h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{user.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}