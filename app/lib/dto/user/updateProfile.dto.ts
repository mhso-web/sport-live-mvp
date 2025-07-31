import { z } from 'zod'

export const UpdateProfileDto = z.object({
  username: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional().nullable()
})

export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"]
})

export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>