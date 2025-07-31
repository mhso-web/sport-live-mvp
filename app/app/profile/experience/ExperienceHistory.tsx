'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Pagination from '@/components/ui/Pagination'
import { EXPERIENCE_ACTION_ICONS, EXPERIENCE_ACTION_DESCRIPTIONS } from '@/lib/constants/experience'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ExperienceLog {
  id: number
  actionType: string
  experienceGained: number
  description: string
  metadata: any
  createdAt: string
}

interface ExperienceStat {
  actionType: string
  count: number
  totalExp: number
}

interface DailyData {
  date: string
  exp: number
}

export default function ExperienceHistory() {
  const [logs, setLogs] = useState<ExperienceLog[]>([])
  const [stats, setStats] = useState<ExperienceStat[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history')

  useEffect(() => {
    fetchExperienceLogs(currentPage)
  }, [currentPage])

  const fetchExperienceLogs = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/experience?page=${page}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data.logs)
        setStats(data.data.stats)
        setDailyData(data.data.dailyData)
        setTotalPages(data.meta.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch experience logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: dailyData.map(d => {
      const date = new Date(d.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        label: '일일 획득 경험치',
        data: dailyData.map(d => d.exp),
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  }

  const getExperienceColor = (exp: number) => {
    if (exp >= 50) return 'text-purple-400'
    if (exp >= 20) return 'text-yellow-400'
    if (exp >= 10) return 'text-green-400'
    return 'text-gray-400'
  }

  const getTotalExperience = () => {
    return stats.reduce((sum, stat) => sum + stat.totalExp, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">경험치 획득 내역</h1>
        <Link 
          href="/profile/my-activities"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← 내 활동으로 돌아가기
        </Link>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{getTotalExperience()}</div>
          <div className="text-gray-400">총 획득 경험치</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.length}</div>
          <div className="text-gray-400">활동 종류</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.reduce((sum, stat) => sum + stat.count, 0)}
          </div>
          <div className="text-gray-400">총 활동 횟수</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {dailyData.length > 0 ? Math.round(getTotalExperience() / dailyData.length) : 0}
          </div>
          <div className="text-gray-400">일평균 경험치</div>
        </div>
      </div>

      {/* 차트 */}
      {dailyData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">최근 30일 경험치 추이</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'history'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              획득 내역
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'stats'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              활동별 통계
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'history' ? (
            <>
              {loading ? (
                <div className="text-center py-8 text-gray-400">로딩 중...</div>
              ) : logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {EXPERIENCE_ACTION_ICONS[log.actionType as keyof typeof EXPERIENCE_ACTION_ICONS] || '⭐'}
                        </span>
                        <div>
                          <p className="text-white font-medium">{log.description}</p>
                          <p className="text-gray-400 text-sm">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getExperienceColor(log.experienceGained)}`}>
                        +{log.experienceGained} EXP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">아직 획득한 경험치가 없습니다.</p>
              )}

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {stats
                .sort((a, b) => b.totalExp - a.totalExp)
                .map((stat) => (
                  <div key={stat.actionType} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {EXPERIENCE_ACTION_ICONS[stat.actionType as keyof typeof EXPERIENCE_ACTION_ICONS] || '⭐'}
                        </span>
                        <span className="text-white font-medium">
                          {EXPERIENCE_ACTION_DESCRIPTIONS[stat.actionType as keyof typeof EXPERIENCE_ACTION_DESCRIPTIONS] || stat.actionType}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{stat.totalExp} EXP</div>
                        <div className="text-gray-400 text-sm">{stat.count}회</div>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${(stat.totalExp / getTotalExperience()) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}