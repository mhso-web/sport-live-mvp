import { z } from 'zod'

export const LoginSchema = z.object({
  username: z.string()
    .min(1, '사용자명을 입력해주세요'),
  password: z.string()
    .min(1, '비밀번호를 입력해주세요')
})

export type LoginDto = z.infer<typeof LoginSchema>