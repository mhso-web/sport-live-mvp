'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { User } from '@prisma/client'

interface Props {
  user: User
}

export default function ProfileEditContent({ user }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 프로필 수정 폼
  const [profileData, setProfileData] = useState({
    username: user.username,
    bio: user.bio || ''
  })

  // 비밀번호 변경 폼
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '프로필 수정에 실패했습니다')
      }

      // 세션 업데이트
      await update({
        ...data.data,
        name: data.data.username
      })

      setSuccess('프로필이 성공적으로 수정되었습니다')
      setTimeout(() => {
        router.push(`/profile/${user.id}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다')
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">프로필 수정</h1>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            프로필 정보
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            비밀번호 변경
          </button>
        </div>
      </div>

      {/* 에러/성공 메시지 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* 프로필 정보 탭 */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-yellow-500 focus:outline-none"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              소개
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-yellow-500 focus:outline-none"
              rows={4}
              maxLength={200}
              placeholder="자기소개를 입력하세요 (최대 200자)"
            />
            <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/200</p>
          </div>


          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '프로필 수정'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/profile/${user.id}`)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 비밀번호 변경 탭 */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-yellow-500 focus:outline-none"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">최소 6자 이상</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}
    </div>
  )
}