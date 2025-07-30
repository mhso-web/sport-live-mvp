'use client'

import { useEffect, useState } from 'react'
import { ExperienceService } from '@/lib/services/experienceService'

interface LevelProgressBarProps {
  userId: number
  currentLevel: number
  currentExperience: number
}

export default function LevelProgressBar({ userId, currentLevel, currentExperience }: LevelProgressBarProps) {
  const [experienceData, setExperienceData] = useState<{
    currentLevelExperience: number
    experienceForNextLevel: number
    progressPercentage: number
  } | null>(null)
  
  useEffect(() => {
    // 클라이언트 사이드에서 진행률 계산
    const nextLevelExp = ExperienceService.getExperienceForNextLevel(currentLevel)
    const currentLevelExp = currentLevel === 1 ? 0 : ExperienceService.getExperienceForNextLevel(currentLevel - 1)
    const progress = ExperienceService.calculateLevelProgress(currentExperience, currentLevel)
    
    setExperienceData({
      currentLevelExperience: currentExperience - currentLevelExp,
      experienceForNextLevel: nextLevelExp - currentLevelExp,
      progressPercentage: progress
    })
  }, [currentLevel, currentExperience])
  
  if (!experienceData) return null
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gold-400 font-medium">Lv.{currentLevel}</span>
        <span className="text-gray-500">
          {experienceData.currentLevelExperience} / {experienceData.experienceForNextLevel} XP
        </span>
      </div>
      <div className="w-48 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500"
          style={{ width: `${experienceData.progressPercentage}%` }}
        />
      </div>
    </div>
  )
}