import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 게시글 필터 DTO
export const PostFiltersDto = z.object({
  search: z.string().optional(),
  categoryId: z.number().optional(),
  userId: z.number().optional(),
  isDeleted: z.boolean().optional(),
  orderBy: z.enum(['createdAt', 'views', 'likesCount', 'commentsCount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  limit: z.number().default(20)
})

export type PostFilters = z.infer<typeof PostFiltersDto>

// 댓글 필터 DTO
export const CommentFiltersDto = z.object({
  search: z.string().optional(),
  postId: z.number().optional(),
  userId: z.number().optional(),
  orderBy: z.enum(['createdAt', 'likesCount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  limit: z.number().default(20)
})

export type CommentFilters = z.infer<typeof CommentFiltersDto>

export interface AdminPost {
  id: number
  title: string
  content: string
  views: number
  isDeleted: boolean
  createdAt: Date
  user: {
    id: number
    username: string
    email: string
  }
  category: {
    id: number
    name: string
    slug: string
  }
  _count: {
    comments: number
    likes: number
  }
}

export interface AdminComment {
  id: number
  content: string
  createdAt: Date
  user: {
    id: number
    username: string
    email: string
  }
  post: {
    id: number
    title: string
  }
  parent?: {
    id: number
    content: string
  }
  _count: {
    likes: number
    replies: number
  }
}

export class AdminPostService {
  /**
   * 게시글 목록 조회
   */
  static async findManyPosts(filters: PostFilters) {
    const { search, categoryId, userId, isDeleted, orderBy, order, page, limit } = filters
    const offset = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (userId) {
      where.userId = userId
    }

    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted
    }

    // 정렬 옵션
    let orderByClause: any = {}
    
    if (orderBy === 'likesCount') {
      // 좋아요 수로 정렬하려면 특별한 처리 필요
      const posts = await prisma.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        }
      })

      // 메모리에서 정렬
      posts.sort((a, b) => {
        const diff = a._count.likes - b._count.likes
        return order === 'desc' ? -diff : diff
      })

      // 페이지네이션 적용
      const paginatedPosts = posts.slice(offset, offset + limit)
      const total = posts.length

      return {
        posts: paginatedPosts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } else if (orderBy === 'commentsCount') {
      // 댓글 수로 정렬
      const posts = await prisma.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        }
      })

      posts.sort((a, b) => {
        const diff = a._count.comments - b._count.comments
        return order === 'desc' ? -diff : diff
      })

      const paginatedPosts = posts.slice(offset, offset + limit)
      const total = posts.length

      return {
        posts: paginatedPosts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } else {
      // 일반 정렬
      orderByClause[orderBy] = order

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          orderBy: orderByClause,
          skip: offset,
          take: limit,
          include: {
            user: {
              select: { id: true, username: true, email: true }
            },
            category: {
              select: { id: true, name: true, slug: true }
            },
            _count: {
              select: {
                comments: true,
                likes: true
              }
            }
          }
        }),
        prisma.post.count({ where })
      ])

      return {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  }

  /**
   * 댓글 목록 조회
   */
  static async findManyComments(filters: CommentFilters) {
    const { search, postId, userId, orderBy, order, page, limit } = filters
    const offset = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}

    if (search) {
      where.content = { contains: search, mode: 'insensitive' }
    }

    if (postId) {
      where.postId = postId
    }

    if (userId) {
      where.userId = userId
    }

    // 정렬 옵션
    let orderByClause: any = {}
    
    if (orderBy === 'likesCount') {
      // 좋아요 수로 정렬
      const comments = await prisma.comment.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          post: {
            select: { id: true, title: true }
          },
          parent: {
            select: { id: true, content: true }
          },
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        }
      })

      comments.sort((a, b) => {
        const diff = a._count.likes - b._count.likes
        return order === 'desc' ? -diff : diff
      })

      const paginatedComments = comments.slice(offset, offset + limit)
      const total = comments.length

      return {
        comments: paginatedComments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } else {
      orderByClause[orderBy] = order

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: orderByClause,
          skip: offset,
          take: limit,
          include: {
            user: {
              select: { id: true, username: true, email: true }
            },
            post: {
              select: { id: true, title: true }
            },
            parent: {
              select: { id: true, content: true }
            },
            _count: {
              select: {
                likes: true,
                replies: true
              }
            }
          }
        }),
        prisma.comment.count({ where })
      ])

      return {
        comments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  }

  /**
   * 게시글 삭제
   */
  static async deletePost(postId: number) {
    // 관련 데이터 먼저 삭제
    await prisma.$transaction([
      // 댓글의 좋아요 삭제
      prisma.commentLike.deleteMany({
        where: {
          comment: {
            postId
          }
        }
      }),
      // 댓글 삭제
      prisma.comment.deleteMany({
        where: { postId }
      }),
      // 게시글 좋아요 삭제
      prisma.postLike.deleteMany({
        where: { postId }
      }),
      // 게시글 삭제
      prisma.post.delete({
        where: { id: postId }
      })
    ])
  }

  /**
   * 게시글 숨기기/보이기 토글
   */
  static async togglePostVisibility(postId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다')
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: !post.isDeleted }
    })

    return updatedPost
  }

  /**
   * 댓글 삭제
   */
  static async deleteComment(commentId: number) {
    // 대댓글이 있는지 확인
    const childrenCount = await prisma.comment.count({
      where: { parentId: commentId }
    })

    if (childrenCount > 0) {
      // 대댓글이 있으면 내용만 변경
      await prisma.comment.update({
        where: { id: commentId },
        data: { 
          content: '삭제된 댓글입니다.',
          isDeleted: true
        }
      })
    } else {
      // 대댓글이 없으면 완전히 삭제
      await prisma.$transaction([
        // 댓글 좋아요 삭제
        prisma.commentLike.deleteMany({
          where: { commentId }
        }),
        // 댓글 삭제
        prisma.comment.delete({
          where: { id: commentId }
        })
      ])
    }
  }

  /**
   * 게시판 목록 조회
   */
  static async getCategories() {
    const categories = await prisma.boardCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        boardType: true,
        _count: {
          select: { posts: true }
        }
      }
    })

    return categories
  }
}