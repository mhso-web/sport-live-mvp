import { z } from 'zod'
import { BoardType } from '@prisma/client'

export const CreatePostSchema = z.object({
  boardType: z.nativeEnum(BoardType),
  categoryId: z.number().int().positive().optional().nullable(),
  title: z.string()
    .min(2, '제목은 2자 이상이어야 합니다')
    .max(200, '제목은 200자 이하여야 합니다')
    .trim(),
  content: z.string()
    .min(10, '내용은 10자 이상이어야 합니다')
    .max(50000, '내용은 50000자 이하여야 합니다'),
  summary: z.string()
    .max(500, '요약은 500자 이하여야 합니다')
    .optional()
    .nullable(),
  isPinned: z.boolean().optional().default(false)
}).refine(
  (data) => {
    // 커뮤니티 게시판은 카테고리가 필수
    if (data.boardType === BoardType.COMMUNITY) {
      return data.categoryId !== null && data.categoryId !== undefined
    }
    return true
  },
  {
    message: '커뮤니티 게시판은 카테고리를 선택해야 합니다',
    path: ['categoryId']
  }
)

export type CreatePostDto = z.infer<typeof CreatePostSchema>