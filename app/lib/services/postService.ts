import { BoardType } from '@prisma/client'
import { PostRepository, PostFilters } from '@/lib/repositories/postRepository'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { UserRepository } from '@/lib/repositories/userRepository'
import { CreatePostDto, CreatePostSchema } from '@/lib/dto/post/createPost.dto'
import { UpdatePostDto, UpdatePostSchema } from '@/lib/dto/post/updatePost.dto'
import { PostResponseDto, PostListItemDto } from '@/lib/dto/post/postResponse.dto'
import { PaginationParams } from '@/lib/repositories/baseRepository'
import { 
  NotFoundException, 
  UnauthorizedException, 
  ForbiddenException, 
  ValidationError 
} from '@/lib/errors'
import { ExperienceService } from './experienceService'

interface AuthenticatedRequest {
  userId: number
  userRole: string
}

export class PostService {
  constructor(
    private postRepository: PostRepository,
    private boardCategoryRepository: BoardCategoryRepository,
    private userRepository: UserRepository
  ) {}

  async create(data: CreatePostDto, auth: AuthenticatedRequest) {
    // 입력값 검증
    const validated = CreatePostSchema.parse(data)

    // 카테고리 검증 (커뮤니티 게시판인 경우)
    if (validated.boardType === BoardType.COMMUNITY && validated.categoryId) {
      const category = await this.boardCategoryRepository.findById(validated.categoryId)
      if (!category || !category.isActive || category.boardType !== BoardType.COMMUNITY) {
        throw new ValidationError([{ 
          path: ['categoryId'], 
          message: '유효하지 않은 카테고리입니다' 
        }])
      }
    }

    // 사용자 확인
    const user = await this.userRepository.findById(auth.userId)
    if (!user) {
      throw new UnauthorizedException()
    }

    // 게시글 생성
    const { categoryId, ...postData } = validated
    const post = await this.postRepository.create({
      ...postData,
      user: { connect: { id: auth.userId } },
      ...(categoryId && {
        category: { connect: { id: categoryId } }
      })
    })

    // 경험치 부여
    await ExperienceService.awardExperience(auth.userId, 'POST_CREATE', {
      postId: post.id,
      boardType: post.boardType
    })

    // 상세 정보 조회 후 반환
    const postWithRelations = await this.postRepository.findWithRelations(post.id)
    if (!postWithRelations) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    return new PostResponseDto(postWithRelations)
  }

  async findAll(filters: PostFilters, pagination?: PaginationParams) {
    const result = await this.postRepository.findByFilters(filters, pagination)
    
    return {
      data: result.data.map(post => new PostListItemDto(post)),
      meta: result.meta
    }
  }

  async findById(id: number) {
    const post = await this.postRepository.findWithRelations(id)
    
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    return new PostResponseDto(post)
  }

  async update(id: number, data: UpdatePostDto, auth: AuthenticatedRequest) {
    // 게시글 확인
    const post = await this.postRepository.findById(id)
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    if (post.userId !== auth.userId && auth.userRole !== 'ADMIN') {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다')
    }

    // 입력값 검증
    const validated = UpdatePostSchema.parse(data)

    // categoryId 분리
    const { categoryId, ...updateData } = validated

    // 업데이트
    await this.postRepository.update(id, {
      ...updateData,
      ...(categoryId && {
        category: { connect: { id: categoryId } }
      })
    })

    // 업데이트된 게시글 조회
    const updatedPost = await this.postRepository.findWithRelations(id)
    if (!updatedPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    return new PostResponseDto(updatedPost)
  }

  async delete(id: number, auth: AuthenticatedRequest) {
    // 게시글 확인
    const post = await this.postRepository.findById(id)
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (post.userId !== auth.userId && auth.userRole !== 'ADMIN') {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다')
    }

    // Soft delete
    await this.postRepository.delete(id)
  }

  async togglePin(id: number, auth: AuthenticatedRequest) {
    // 관리자만 고정 가능
    if (auth.userRole !== 'ADMIN') {
      throw new ForbiddenException('게시글을 고정할 권한이 없습니다')
    }

    const post = await this.postRepository.findById(id)
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다')
    }

    await this.postRepository.update(id, {
      isPinned: !post.isPinned
    })
  }

}