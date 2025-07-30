'use client'

import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20,
  onItemsPerPageChange,
  showItemsPerPage = false,
  itemsPerPageOptions = [10, 20, 30, 50]
}: PaginationProps) {
  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const delta = 2 // 현재 페이지 좌우로 보여줄 페이지 수
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* 모바일: 간단한 이전/다음 버튼 */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          이전
        </button>
        <span className="text-sm text-gray-400">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>

      {/* 데스크톱: 전체 페이지네이션 */}
      <div className="hidden sm:flex items-center gap-1">
        {/* 처음 페이지 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="처음 페이지"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>

        {/* 이전 페이지 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* 페이지 번호들 */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((number, index) => (
            number === '...' ? (
              <span key={`dots-${index}`} className="px-3 py-1 text-gray-500">
                ⋯
              </span>
            ) : (
              <button
                key={number}
                onClick={() => onPageChange(number as number)}
                className={`min-w-[2.5rem] px-3 py-1 rounded-md transition-colors ${
                  number === currentPage
                    ? 'bg-gold-600 text-white font-medium'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                {number}
              </button>
            )
          ))}
        </div>

        {/* 다음 페이지 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="다음 페이지"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* 마지막 페이지 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="마지막 페이지"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 페이지당 항목 수 선택 */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-gray-400">
            페이지당
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 rounded-md bg-dark-700 text-gray-300 border border-dark-600 focus:border-gold-500 focus:outline-none transition-colors"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}개
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 페이지 정보 (모바일에서는 숨김) */}
      <div className="hidden sm:block text-sm text-gray-400">
        <span className="text-gray-300 font-medium">{currentPage}</span> / {totalPages} 페이지
      </div>
    </div>
  )
}