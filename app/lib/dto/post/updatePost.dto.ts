import { z } from 'zod'

export const UpdatePostSchema = z.object({
  title: z.string()
    .min(2, '제목은 2자 이상이어야 합니다')
    .max(200, '제목은 200자 이하여야 합니다')
    .trim()
    .optional(),
  content: z.string()
    .min(10, '내용은 10자 이상이어야 합니다')
    .max(50000, '내용은 50000자 이하여야 합니다')
    .optional(),
  summary: z.string()
    .max(500, '요약은 500자 이하여야 합니다')
    .optional()
    .nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  isPinned: z.boolean().optional()
})

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>