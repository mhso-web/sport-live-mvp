'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/ui/Pagination'
import PartnerFormModal from './PartnerFormModal'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import { formatDate } from '@/lib/utils/format'

interface Partner {
  id: number
  name: string
  description: string
  detailContent?: string
  websiteUrl?: string
  bannerImage?: string
  isActive: boolean
  viewCount: number
  createdAt: string
  avgRating: number
  _count: {
    ratings: number
    comments: number
    likes: number
  }
}

export default function PartnerManagementContent() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null)
  
  const { data: session } = useSession()
  const router = useRouter()

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (search) params.append('search', search)
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false')
      }

      const response = await fetch(`/api/admin/partners?${params}`)
      const data = await response.json()

      if (data.success) {
        setPartners(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      }
    } catch (error) {
      console.error('보증업체 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, statusFilter])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleToggleStatus = async (partner: Partner) => {
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/toggle-status`, {
        method: 'PATCH'
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchPartners()
      }
    } catch (error) {
      console.error('상태 변경 실패:', error)
    }
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setIsFormModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingPartner) return

    try {
      const response = await fetch(`/api/admin/partners/${deletingPartner.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDeletingPartner(null)
        fetchPartners()
      }
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  const handleFormSubmit = () => {
    setIsFormModalOpen(false)
    setEditingPartner(null)
    fetchPartners()
  }

  return (
    <>
      <div className="bg-gray-900 rounded-lg p-6">
        {/* 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="업체명으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          {/* 추가 버튼 */}
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
          >
            <FaPlus />
            새 보증업체 추가
          </button>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>등록된 보증업체가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">업체명</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">평점</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">댓글</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">조회수</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">등록일</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-4 text-gray-300">{partner.id}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-medium">{partner.name}</p>
                        <p className="text-sm text-gray-400 truncate max-w-xs">
                          {partner.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(partner)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          partner.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {partner.isActive ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FaStar className="text-yellow-400 w-4 h-4" />
                        <span className="text-white">
                          {partner.avgRating.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ({partner._count.ratings})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-300">
                      {partner._count.comments}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-300">
                      {partner.viewCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {formatDate(partner.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="수정"
                        >
                          <FaEdit />
                        </button>
                        {session?.user?.role === 'ADMIN' && (
                          <button
                            onClick={() => setDeletingPartner(partner)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="삭제"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
      </div>

      {/* 모달들 */}
      <PartnerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingPartner(null)
        }}
        onSubmit={handleFormSubmit}
        partner={editingPartner}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingPartner}
        onClose={() => setDeletingPartner(null)}
        onConfirm={handleDelete}
        title="보증업체 삭제"
        message={`'${deletingPartner?.name}' 보증업체를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  )
}