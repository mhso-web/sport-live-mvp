'use client'

import { useEffect, useState } from 'react'

export default function TestApiPage() {
  const [boardsData, setBoardsData] = useState<any>(null)
  const [postsData, setPostsData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testApi()
  }, [])

  const testApi = async () => {
    try {
      // Test boards API
      const boardsRes = await fetch('/api/boards')
      const boards = await boardsRes.json()
      setBoardsData(boards)

      // Test posts API
      const postsRes = await fetch('/api/posts?categorySlug=general&limit=5')
      const posts = await postsRes.json()
      setPostsData(posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="p-8 bg-dark-900 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-dark-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Boards API Response:</h2>
          <pre className="text-xs overflow-auto bg-dark-700 p-2 rounded">
            {JSON.stringify(boardsData, null, 2)}
          </pre>
        </div>

        <div className="bg-dark-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Posts API Response:</h2>
          <pre className="text-xs overflow-auto bg-dark-700 p-2 rounded">
            {JSON.stringify(postsData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}