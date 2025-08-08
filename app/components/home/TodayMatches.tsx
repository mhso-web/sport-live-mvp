'use client';

import Link from 'next/link';

interface Match {
  id: number;
  scheduledTime: Date;
  status: string;
  sport: {
    nameKo: string;
    icon?: string | null;
    slug: string;
  } | null;
  leagueRef: {
    nameKo: string;
    slug: string;
  } | null;
  homeTeamRef: {
    nameKo: string;
    logo?: string | null;
  } | null;
  awayTeamRef: {
    nameKo: string;
    logo?: string | null;
  } | null;
}

interface TodayMatchesProps {
  matches: Match[];
}

export default function TodayMatches({ matches }: TodayMatchesProps) {
  if (matches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">오늘 예정된 경기가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {matches.map((match) => {
        const matchTime = new Date(match.scheduledTime);
        const hours = matchTime.getHours().toString().padStart(2, '0');
        const minutes = matchTime.getMinutes().toString().padStart(2, '0');
        
        return (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-yellow-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {match.sport?.icon && (
                  <span className="text-xl">{match.sport.icon}</span>
                )}
                <span className="text-sm text-gray-400">
                  {match.sport?.nameKo || '스포츠'}
                </span>
              </div>
              <span className="text-sm font-medium text-yellow-400">
                {hours}:{minutes}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              {match.leagueRef?.nameKo || '리그'}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-200 truncate px-1">
                  {match.homeTeamRef?.nameKo || '홈팀'}
                </p>
              </div>
              
              <div className="px-3 text-gray-500 text-sm">
                VS
              </div>
              
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-200 truncate px-1">
                  {match.awayTeamRef?.nameKo || '원정팀'}
                </p>
              </div>
            </div>

            {match.status === 'LIVE' && (
              <div className="mt-3 flex items-center justify-center">
                <span className="px-2 py-1 bg-red-900 text-red-400 text-xs rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}