'use client';

import { Match, sportTypeIcons, matchStatusLabels, matchStatusColors } from '@/types/match.types';
import { useRouter } from 'next/navigation';

interface MatchListProps {
  matches: Match[];
}

export default function MatchList({ matches }: MatchListProps) {
  const router = useRouter();
  
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleChatJoin = (matchId: string) => {
    router.push(`/live?match=${matchId}`);
  };
  
  // 리그별로 그룹핑
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.competition]) {
      acc[match.competition] = [];
    }
    acc[match.competition].push(match);
    return acc;
  }, {} as Record<string, Match[]>);
  
  if (matches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-16 text-center border border-gray-700">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">경기가 없습니다</h3>
        <p className="text-gray-400">선택된 날짜에 예정된 경기가 없습니다.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([competition, competitionMatches]) => (
        <div key={competition} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {/* 리그 헤더 */}
          <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">{sportTypeIcons[competitionMatches[0].sportType]}</span>
              <h3 className="font-semibold text-gray-100">{competition}</h3>
              <span className="text-sm text-gray-400">({competitionMatches.length}경기)</span>
            </div>
          </div>
          
          {/* 경기 리스트 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="text-xs text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left w-16">시간</th>
                  <th className="px-3 py-2 text-left w-16">상태</th>
                  <th className="px-3 py-2 text-right min-w-[140px]">홈팀</th>
                  <th className="px-3 py-2 text-center w-20">스코어</th>
                  <th className="px-3 py-2 text-left min-w-[140px]">원정팀</th>
                  <th className="px-3 py-2 text-left min-w-[100px]">경기장</th>
                  <th className="px-3 py-2 text-center w-16">시청</th>
                  <th className="px-3 py-2 text-center w-20">채팅</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {competitionMatches.map((match) => {
                  const isLive = match.status === 'live';
                  const isFinished = match.status === 'finished';
                  const showScore = isLive || isFinished;
                  
                  return (
                    <tr key={match.id} className="hover:bg-gray-750 transition-colors">
                      {/* 시간 */}
                      <td className="px-3 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {formatTime(new Date(match.scheduledTime))}
                      </td>
                      
                      {/* 상태 */}
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold whitespace-nowrap ${matchStatusColors[match.status]}`}>
                          {matchStatusLabels[match.status]}
                          {isLive && match.currentMinute && ` ${match.currentMinute}'`}
                        </span>
                      </td>
                      
                      {/* 홈팀 */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm font-medium truncate max-w-[120px] ${
                            isFinished && match.homeScore! > match.awayScore! 
                              ? 'text-green-400' 
                              : isFinished && match.homeScore! < match.awayScore!
                              ? 'text-gray-500'
                              : 'text-gray-100'
                          }`} title={match.homeTeam.name}>
                            {match.homeTeam.name}
                          </span>
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center text-xs">
                            {match.homeTeam.shortName.slice(0, 2)}
                          </div>
                        </div>
                      </td>
                      
                      {/* 스코어 */}
                      <td className="px-3 py-3 text-center">
                        {showScore ? (
                          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                            <span className={`text-sm font-bold ${
                              isFinished && match.homeScore! > match.awayScore! 
                                ? 'text-green-400' 
                                : isFinished && match.homeScore! < match.awayScore!
                                ? 'text-gray-500'
                                : 'text-gray-100'
                            }`}>
                              {match.homeScore}
                            </span>
                            <span className="text-gray-500 text-xs">:</span>
                            <span className={`text-sm font-bold ${
                              isFinished && match.awayScore! > match.homeScore! 
                                ? 'text-green-400' 
                                : isFinished && match.awayScore! < match.homeScore!
                                ? 'text-gray-500'
                                : 'text-gray-100'
                            }`}>
                              {match.awayScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">vs</span>
                        )}
                      </td>
                      
                      {/* 원정팀 */}
                      <td className="px-3 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center text-xs">
                            {match.awayTeam.shortName.slice(0, 2)}
                          </div>
                          <span className={`text-sm font-medium truncate max-w-[120px] ${
                            isFinished && match.awayScore! > match.homeScore! 
                              ? 'text-green-400' 
                              : isFinished && match.awayScore! < match.homeScore!
                              ? 'text-gray-500'
                              : 'text-gray-100'
                          }`} title={match.awayTeam.name}>
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </td>
                      
                      {/* 경기장 */}
                      <td className="px-3 py-3 text-sm text-gray-400">
                        <span className="truncate block max-w-[100px]" title={match.venue}>
                          {match.venue || '-'}
                        </span>
                      </td>
                      
                      {/* 시청자 수 */}
                      <td className="px-3 py-3 text-center">
                        {isLive && match.viewerCount ? (
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {match.viewerCount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      
                      {/* 채팅 버튼 */}
                      <td className="px-3 py-3 text-center">
                        {match.hasChat && (
                          <button
                            onClick={() => handleChatJoin(match.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                              isLive 
                                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            {isLive ? '🔴' : '💬'}
                            <span className="ml-1 hidden sm:inline">
                              {isLive ? 'LIVE' : '입장'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}