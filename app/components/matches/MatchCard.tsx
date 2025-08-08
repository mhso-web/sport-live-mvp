'use client';

import { Match, sportTypeIcons, matchStatusLabels, matchStatusColors } from '@/types/match.types';
import { useRouter } from 'next/navigation';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();
  
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleChatJoin = () => {
    // 나중에 실제 채팅방 연결
    router.push(`/live?match=${match.id}`);
  };
  
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore = isLive || isFinished;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        {/* 상단: 리그 정보 및 상태 */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sportTypeIcons[match.sportType]}</span>
          <div>
            <div className="text-sm text-gray-400">{match.competition}</div>
            {match.round && <div className="text-xs text-gray-500">{match.round}</div>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-sm font-semibold ${matchStatusColors[match.status]}`}>
            {matchStatusLabels[match.status]}
            {isLive && match.currentMinute && ` ${match.currentMinute}'`}
          </span>
          {isLive && match.viewerCount && (
            <span className="text-xs text-gray-400">
              👁 {match.viewerCount.toLocaleString()}명 시청중
            </span>
          )}
        </div>
      </div>
      
      {/* 중간: 팀 정보 및 스코어 */}
      <div className="space-y-2 mb-3">
        {/* 홈 팀 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">
              {match.homeTeam.shortName.slice(0, 2)}
            </div>
            <span className="text-gray-100 font-medium">{match.homeTeam.name}</span>
          </div>
          {showScore && (
            <span className={`text-xl font-bold ${
              isFinished && match.homeScore! > match.awayScore! ? 'text-green-400' : 
              isFinished && match.homeScore! < match.awayScore! ? 'text-gray-500' : 
              'text-gray-100'
            }`}>
              {match.homeScore}
            </span>
          )}
        </div>
        
        {/* 원정 팀 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">
              {match.awayTeam.shortName.slice(0, 2)}
            </div>
            <span className="text-gray-100 font-medium">{match.awayTeam.name}</span>
          </div>
          {showScore && (
            <span className={`text-xl font-bold ${
              isFinished && match.awayScore! > match.homeScore! ? 'text-green-400' : 
              isFinished && match.awayScore! < match.homeScore! ? 'text-gray-500' : 
              'text-gray-100'
            }`}>
              {match.awayScore}
            </span>
          )}
        </div>
      </div>
      
      {/* 하단: 시간, 장소, 채팅방 버튼 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <div>{formatTime(new Date(match.scheduledTime))}</div>
          {match.venue && <div className="text-xs">{match.venue}</div>}
        </div>
        
        {match.hasChat && (
          <button
            onClick={handleChatJoin}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isLive 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLive ? '🔴 라이브 채팅 참여' : '💬 채팅방 입장'}
          </button>
        )}
      </div>
    </div>
  );
}