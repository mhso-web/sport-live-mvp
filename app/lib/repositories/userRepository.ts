import { prisma } from '@/lib/prisma'
import { User, Prisma } from '@prisma/client'

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  update(id: number, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: number): Promise<void>
}

export class UserRepository implements IUserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data })
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    })
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  }

  async updateLastLogin(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    })
  }
}