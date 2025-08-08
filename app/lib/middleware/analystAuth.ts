import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAnalyst(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return ApiResponse.unauthorized('Authentication required');
  }

  // Check if user has analyst role
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true },
  });

  if (!user || (user.role !== 'ANALYST' && user.role !== 'ADMIN')) {
    return ApiResponse.forbidden('Analyst permission required');
  }

  return null; // Permission granted
}

export async function requireAnalystProfile(userId: number) {
  const profile = await prisma.analystProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    // Create default analyst profile if it doesn't exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await prisma.analystProfile.create({
      data: {
        userId,
        displayName: user.username,
        specialties: [],
        description: '스포츠 분석가',
      },
    });
  }

  return profile;
}