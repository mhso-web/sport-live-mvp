'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaTrash, FaEye, FaEyeSlash, FaComment, FaHeart, FaExternalLinkAlt } from 'react-icons/fa'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import Pagination from '@/components/common/Pagination'
import type { AdminPost, AdminComment } from '@/services/admin/adminPostService'

interface Category {
  id: number
  name: string
  categoryType: string
  _count: { posts: number }
}

export default function PostManagementContent() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // 게시글 필터
  const [postSearch, setPostSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [postOrderBy, setPostOrderBy] = useState('createdAt')
  const [postOrder, setPostOrder] = useState<'asc' | 'desc'>('desc')
  const [postPage, setPostPage] = useState(1)
  const [postTotalPages, setPostTotalPages] = useState(1)
  const [postTotal, setPostTotal] = useState(0)
  
  // 댓글 필터
  const [commentSearch, setCommentSearch] = useState('')
  const [commentOrderBy, setCommentOrderBy] = useState('createdAt')
  const [commentOrder, setCommentOrder] = useState<'asc' | 'desc'>('desc')
  const [commentPage, setCommentPage] = useState(1)
  const [commentTotalPages, setCommentTotalPages] = useState(1)
  const [commentTotal, setCommentTotal] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts()
    } else {
      fetchComments()
    }
  }, [activeTab, postSearch, categoryFilter, postOrderBy, postOrder, postPage, commentSearch, commentOrderBy, commentOrder, commentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: postPage.toString(),
        limit: '20',
        orderBy: postOrderBy,
        order: postOrder
      })

      if (postSearch) params.append('search', postSearch)
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter)

      const response = await fetch(`/api/admin/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      setPosts(data.data.posts)
      setPostTotalPages(data.data.pagination.totalPages)
      setPostTotal(data.data.pagination.total)
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: commentPage.toString(),
        limit: '20',
        orderBy: commentOrderBy,
        order: commentOrder
      })

      if (commentSearch) params.append('search', commentSearch)

      const response = await fetch(`/api/admin/comments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch comments')

      const data = await response.json()
      setComments(data.data.comments)
      setCommentTotalPages(data.data.pagination.totalPages)
      setCommentTotal(data.data.pagination.total)
    } catch (error) {
      console.error('댓글 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (post: AdminPost) => {
    if (!confirm(`"${post.title}" 게시글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '삭제 실패')
      }

      alert('게시글이 삭제되었습니다.')
      fetchPosts()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleVisibility = async (post: AdminPost) => {
    try {
      const response = await fetch(`/api/admin/posts/${post.id}/visibility`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '변경 실패')
      }

      fetchPosts()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteComment = async (comment: AdminComment) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '삭제 실패')
      }

      alert('댓글이 삭제되었습니다.')
      fetchComments()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  if (loading && posts.length === 0 && comments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">게시글/댓글 관리</h1>
        <p className="text-gray-400">
          게시글 {postTotal.toLocaleString()}개, 댓글 {commentTotal.toLocaleString()}개
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          게시글 관리
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          댓글 관리
        </button>
      </div>

      {activeTab === 'posts' ? (
        <>
          {/* 게시글 필터 */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 검색 */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="제목 또는 내용 검색"
                  value={postSearch}
                  onChange={(e) => {
                    setPostSearch(e.target.value)
                    setPostPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* 게시판 필터 */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPostPage(1)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="all">모든 게시판</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count.posts})
                  </option>
                ))}
              </select>

              {/* 정렬 */}
              <select
                value={`${postOrderBy}-${postOrder}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  setPostOrderBy(field)
                  setPostOrder(direction as 'asc' | 'desc')
                  setPostPage(1)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="createdAt-desc">최신순</option>
                <option value="createdAt-asc">오래된순</option>
                <option value="views-desc">조회수 많은순</option>
                <option value="likesCount-desc">좋아요 많은순</option>
                <option value="commentsCount-desc">댓글 많은순</option>
              </select>

              {/* 필터 초기화 */}
              <button
                onClick={() => {
                  setPostSearch('')
                  setCategoryFilter('all')
                  setPostOrderBy('createdAt')
                  setPostOrder('desc')
                  setPostPage(1)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 게시글 테이블 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">제목</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">작성자</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">게시판</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">통계</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">작성일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">상태</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-white truncate">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {truncateText(stripHtml(post.content), 50)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-white">{post.user.username}</p>
                          <p className="text-gray-500">{post.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {post.category.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FaEye className="w-3 h-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaHeart className="w-3 h-3" />
                            {post._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment className="w-3 h-3" />
                            {post._count.comments}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {format(new Date(post.createdAt), 'yyyy.MM.dd', { locale: ko })}
                      </td>
                      <td className="px-4 py-3">
                        {post.isDeleted ? (
                          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                            숨김
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                            공개
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/boards/${post.category.id}/${post.id}`}
                            target="_blank"
                            className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="게시글 보기"
                          >
                            <FaExternalLinkAlt className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleToggleVisibility(post)}
                            className={`p-1.5 ${
                              post.isDeleted
                                ? 'text-green-400 hover:bg-green-500/20'
                                : 'text-orange-400 hover:bg-orange-500/20'
                            } rounded transition-colors`}
                            title={post.isDeleted ? '공개하기' : '숨기기'}
                          >
                            {post.isDeleted ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title="삭제"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 게시글 페이지네이션 */}
          {postTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={postPage}
                totalPages={postTotalPages}
                onPageChange={setPostPage}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* 댓글 필터 */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 검색 */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="댓글 내용 검색"
                  value={commentSearch}
                  onChange={(e) => {
                    setCommentSearch(e.target.value)
                    setCommentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* 정렬 */}
              <select
                value={`${commentOrderBy}-${commentOrder}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  setCommentOrderBy(field)
                  setCommentOrder(direction as 'asc' | 'desc')
                  setCommentPage(1)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="createdAt-desc">최신순</option>
                <option value="createdAt-asc">오래된순</option>
                <option value="likesCount-desc">좋아요 많은순</option>
              </select>

              {/* 필터 초기화 */}
              <button
                onClick={() => {
                  setCommentSearch('')
                  setCommentOrderBy('createdAt')
                  setCommentOrder('desc')
                  setCommentPage(1)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 댓글 테이블 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">댓글 내용</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">작성자</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">게시글</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">통계</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">작성일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-white whitespace-pre-wrap">
                            {truncateText(comment.content, 100)}
                          </p>
                          {comment.parent && (
                            <p className="text-sm text-gray-500 mt-1">
                              ↳ 답글: {truncateText(comment.parent.content, 50)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-white">{comment.user.username}</p>
                          <p className="text-gray-500">{comment.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/boards/${comment.post.id}`}
                          target="_blank"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          {truncateText(comment.post.title, 30)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FaHeart className="w-3 h-3" />
                            {comment._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment className="w-3 h-3" />
                            {comment._count.replies}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteComment(comment)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="삭제"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {comments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 댓글 페이지네이션 */}
          {commentTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={commentPage}
                totalPages={commentTotalPages}
                onPageChange={setCommentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}