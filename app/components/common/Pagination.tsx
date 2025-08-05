interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        처음
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        이전
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              currentPage === page
                ? 'bg-yellow-500 border-yellow-500 text-black'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
      
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        마지막
      </button>
    </div>
  )
}