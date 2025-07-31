'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { UserProfile } from '@/lib/services/userService'
import LevelProgressBar from '@/components/ui/LevelProgressBar'
import BadgeDisplay from '@/components/ui/BadgeDisplay'
import { BADGE_INFO, type BadgeType } from '@/lib/constants/badges'

interface Props {
  profile: UserProfile
  isOwnProfile: boolean
}

export default function ProfileContent({ profile, isOwnProfile }: Props) {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'partners'>('posts')
  
  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-400' // 마스터
    if (level >= 15) return 'text-blue-400'   // 다이아몬드
    if (level >= 10) return 'text-yellow-400' // 골드
    if (level >= 5) return 'text-gray-300'    // 실버
    return 'text-orange-400' // 브론즈
  }

  const getLevelBadge = (level: number) => {
    if (level >= 20) return '👑'
    if (level >= 15) return '💎'
    if (level >= 10) return '🏆'
    if (level >= 5) return '🥈'
    return '🥉'
  }

  const maskEmail = (email: string | null) => {
    if (!email) return '비공개'
    if (isOwnProfile) return email
    
    const parts = email.split('@')
    if (parts.length !== 2) return '비공개'
    
    const localPart = parts[0]
    const maskedLocal = localPart.substring(0, 2) + '***'
    return `${maskedLocal}@${parts[1]}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 프로필 헤더 */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {profile.user.username}
              </h1>
              <span className={`text-xl font-bold ${getLevelColor(profile.user.level)}`}>
                {getLevelBadge(profile.user.level)} Lv.{profile.user.level}
              </span>
            </div>
            
            <div className="text-gray-400 space-y-1">
              <p>이메일: {maskEmail(profile.user.email)}</p>
              <p>가입일: {formatDistanceToNow(new Date(profile.user.createdAt), { 
                addSuffix: true, 
                locale: ko 
              })}</p>
              {profile.user.lastLoginAt && (
                <p>마지막 로그인: {formatDistanceToNow(new Date(profile.user.lastLoginAt), { 
                  addSuffix: true, 
                  locale: ko 
                })}</p>
              )}
            </div>
            
            {profile.user.bio && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap">{profile.user.bio}</p>
              </div>
            )}
          </div>
          
          {isOwnProfile && (
            <div className="flex gap-2">
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              >
                프로필 수정
              </Link>
              <Link
                href="/profile/my-activities"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                내 활동 내역
              </Link>
            </div>
          )}
        </div>

        {/* 레벨 진행률 */}
        <div className="mt-6">
          <LevelProgressBar
            userId={profile.user.id}
            currentLevel={profile.user.level}
            currentExperience={profile.user.experience}
          />
        </div>
      </div>

      {/* 뱃지 섹션 */}
      {profile.badges.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">획득한 뱃지</h2>
          <div className="flex flex-wrap gap-3">
            {profile.badges
              .sort((a, b) => {
                // 뱃지 레벨로 정렬 (높은 레벨 먼저)
                const aInfo = BADGE_INFO[a.badgeType as BadgeType]
                const bInfo = BADGE_INFO[b.badgeType as BadgeType]
                if (aInfo && bInfo) {
                  return bInfo.level - aInfo.level
                }
                return 0
              })
              .map((badge) => (
                <BadgeDisplay key={badge.id} badge={badge} size="sm" />
              ))}
          </div>
        </div>
      )}

      {/* 활동 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{profile.stats.postCount}</div>
          <div className="text-gray-400">게시글</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{profile.stats.commentCount}</div>
          <div className="text-gray-400">댓글</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{profile.stats.likeReceivedCount}</div>
          <div className="text-gray-400">받은 좋아요</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{profile.stats.totalViews}</div>
          <div className="text-gray-400">총 조회수</div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'posts'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              최근 게시글
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'comments'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              최근 댓글
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'partners'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              보증업체 활동
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'posts' ? (
            <div className="space-y-3">
              {profile.recentPosts.length > 0 ? (
                profile.recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {post.boardCategory && (
                        <span>[{post.boardCategory.name}]</span>
                      )}
                      <span>조회 {post.views}</span>
                      <span>좋아요 {post.likeCount}</span>
                      <span>댓글 {post.commentCount}</span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">아직 작성한 게시글이 없습니다.</p>
              )}
            </div>
          ) : activeTab === 'comments' ? (
            <div className="space-y-3">
              {profile.recentComments.length > 0 ? (
                profile.recentComments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/posts/${comment.post.id}`}
                    className="block p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <div className="text-sm text-gray-400">
                      <span className="text-yellow-400">{comment.post.title}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">아직 작성한 댓글이 없습니다.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {profile.partnerActivities.length > 0 ? (
                profile.partnerActivities.map((activity) => (
                  <Link
                    key={activity.partnerId}
                    href={`/partners/${activity.partnerId}`}
                    className="block p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <h3 className="font-semibold text-white mb-2">{activity.partnerName}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      {activity.hasLiked && (
                        <span className="text-red-400">❤️ 좋아요</span>
                      )}
                      {activity.hasCommented && (
                        <span className="text-blue-400">💬 댓글 작성</span>
                      )}
                      {activity.hasRated && (
                        <span className="text-yellow-400">⭐ {activity.rating}점 평가</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      마지막 활동: {formatDistanceToNow(new Date(activity.lastActivityAt), { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">아직 보증업체 활동이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}