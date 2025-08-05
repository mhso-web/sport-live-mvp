'use client'

import Link from 'next/link'
import { FaHome, FaArrowLeft } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 삭제되었습니다.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors w-full sm:w-auto"
          >
            <FaHome className="w-4 h-4" />
            홈으로 이동
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
          >
            <FaArrowLeft className="w-4 h-4" />
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  )
}