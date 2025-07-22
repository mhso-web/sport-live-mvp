import { PostWithRelations } from '@/lib/repositories/postRepository'

export class PostResponseDto {
  id: number
  title: string
  content: string
  summary: string | null
  views: number
  boardType: string
  category: {
    id: number
    name: string
    slug: string
  } | null
  author: {
    id: number
    username: string
    level: number
    profileImage: string | null
  }
  stats: {
    views: number
    likes: number
    comments: number
  }
  isPinned: boolean
  createdAt: string
  updatedAt: string

  constructor(post: PostWithRelations) {
    this.id = post.id
    this.title = post.title
    this.content = post.content
    this.summary = post.summary
    this.views = post.views
    this.boardType = post.boardType
    this.category = post.category
    this.author = {
      id: post.user.id,
      username: post.user.username,
      level: post.user.level,
      profileImage: post.user.profileImage
    }
    this.stats = {
      views: post.views,
      likes: post._count.likes,
      comments: post._count.comments
    }
    this.isPinned = post.isPinned
    this.createdAt = post.createdAt.toISOString()
    this.updatedAt = post.updatedAt.toISOString()
  }
}

export class PostListItemDto {
  id: number
  title: string
  summary: string | null
  boardType: string
  category: {
    name: string
    slug: string
  } | null
  author: {
    username: string
    level: number
  }
  stats: {
    views: number
    likes: number
    comments: number
  }
  isPinned: boolean
  createdAt: string

  constructor(post: PostWithRelations) {
    this.id = post.id
    this.title = post.title
    this.summary = post.summary || post.content.substring(0, 200) + '...'
    this.boardType = post.boardType
    this.category = post.category ? {
      name: post.category.name,
      slug: post.category.slug
    } : null
    this.author = {
      username: post.user.username,
      level: post.user.level
    }
    this.stats = {
      views: post.views,
      likes: post._count.likes,
      comments: post._count.comments
    }
    this.isPinned = post.isPinned
    this.createdAt = post.createdAt.toISOString()
  }
}