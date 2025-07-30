'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface PostSearchProps {
  categorySlug?: string
}

export default function PostSearch({ categorySlug }: PostSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
      params.delete('page') // Reset to page 1 when searching
    } else {
      params.delete('q')
    }

    const basePath = categorySlug ? `/posts/${categorySlug}` : '/posts'
    router.push(`${basePath}?${params.toString()}`)
  }, [searchQuery, categorySlug, searchParams, router])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    
    const basePath = categorySlug ? `/posts/${categorySlug}` : '/posts'
    router.push(`${basePath}?${params.toString()}`)
  }, [categorySlug, searchParams, router])

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="게시글 검색..."
          className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <button
        type="submit"
        className="absolute inset-y-0 right-0 px-4 text-gold-500 hover:text-gold-400 font-medium"
        style={{ display: 'none' }}
      >
        검색
      </button>
    </form>
  )
}