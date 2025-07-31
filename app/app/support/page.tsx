'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type TabType = 'notice' | 'faq' | 'inquiry'

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('notice')

  const tabs = [
    { id: 'notice', label: '공지사항', icon: '📢' },
    { id: 'faq', label: '자주묻는 질문', icon: '❓' },
    { id: 'inquiry', label: '1:1 문의', icon: '💬' }
  ]

  return (
    <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">고객센터</h1>
            <p className="mt-2 text-gray-400">도움이 필요하신가요? 고객센터에서 해결해드립니다.</p>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex space-x-1 bg-dark-800 rounded-lg p-1 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-dark-700 text-gold-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div>
            {activeTab === 'notice' && <NoticeSection />}
            {activeTab === 'faq' && <FAQSection />}
            {activeTab === 'inquiry' && <InquirySection />}
          </div>
        </div>
      </main>
  )
}

// 공지사항 섹션
function NoticeSection() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/posts?boardType=NOTICE&limit=5')
      const data = await response.json()
      
      if (data.success) {
        setNotices(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
      <div className="divide-y divide-dark-700">
        {notices.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            아직 공지사항이 없습니다.
          </div>
        ) : (
          notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notice/${notice.id}`}
              className="block px-6 py-4 hover:bg-dark-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {notice.isPinned && (
                    <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                      중요
                    </span>
                  )}
                  <h3 className="text-gray-100 font-medium hover:text-gold-500 transition-colors">
                    {notice.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="px-6 py-4 bg-dark-700/30 text-center">
        <Link
          href="/notice"
          className="text-sm text-gold-500 hover:text-gold-400 transition-colors"
        >
          모든 공지사항 보기 →
        </Link>
      </div>
    </div>
  )
}

// FAQ 섹션
function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      id: 1,
      question: '회원가입은 어떻게 하나요?',
      answer: '상단 메뉴의 회원가입 버튼을 클릭하시면 간단한 정보 입력으로 가입하실 수 있습니다.'
    },
    {
      id: 2,
      question: '비밀번호를 잊어버렸어요.',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 이메일로 재설정 링크를 보내드립니다.'
    },
    {
      id: 3,
      question: '실시간 중계는 무료인가요?',
      answer: '네, 모든 실시간 중계 서비스는 무료로 제공됩니다.'
    },
    {
      id: 4,
      question: '게시글 작성 권한은 어떻게 되나요?',
      answer: '로그인한 모든 회원은 게시글을 작성하실 수 있습니다. 단, 공지사항은 관리자만 작성 가능합니다.'
    }
  ]

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden"
        >
          <button
            onClick={() => toggleItem(faq.id)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-dark-700/50 transition-colors"
          >
            <span className="text-gray-100 font-medium">{faq.question}</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                openItems.includes(faq.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.includes(faq.id) && (
            <div className="px-6 py-4 border-t border-dark-700 bg-dark-700/30">
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// 1:1 문의 섹션
function InquirySection() {
  return (
    <div>
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gold-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-100">1:1 문의하기</h3>
            <p className="text-sm text-gray-400">답변은 평균 24시간 이내에 제공됩니다.</p>
          </div>
        </div>
        <Link
          href="/support/inquiry/new"
          className="btn-premium inline-block"
        >
          새 문의 작성
        </Link>
      </div>

      {/* 내 문의 내역 */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-medium text-gray-100">내 문의 내역</h3>
        </div>
        <div className="divide-y divide-dark-700">
          <div className="px-6 py-8 text-center text-gray-500">
            <p>문의 내역이 없습니다.</p>
            <p className="text-sm mt-2">로그인 후 이용해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}