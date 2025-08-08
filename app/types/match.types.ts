export type SportType = 'football' | 'baseball' | 'basketball' | 'esports' | 'volleyball';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  country?: string;
}

export interface Match {
  id: string;
  sportType: SportType;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  venue?: string;
  competition: string;
  round?: string;
  currentMinute?: number; // For live matches
  hasChat: boolean;
  viewerCount?: number;
}

export interface MatchDay {
  date: Date;
  matches: Match[];
}

export const sportTypeLabels: Record<SportType, string> = {
  football: '축구',
  baseball: '야구',
  basketball: '농구',
  esports: 'e스포츠',
  volleyball: '배구'
};

export const sportTypeIcons: Record<SportType, string> = {
  football: '⚽',
  baseball: '⚾',
  basketball: '🏀',
  esports: '🎮',
  volleyball: '🏐'
};

export const matchStatusLabels: Record<MatchStatus, string> = {
  scheduled: '예정',
  live: '진행중',
  finished: '종료',
  cancelled: '취소',
  postponed: '연기'
};

export const matchStatusColors: Record<MatchStatus, string> = {
  scheduled: 'text-gray-400',
  live: 'text-red-500',
  finished: 'text-gray-600',
  cancelled: 'text-gray-500',
  postponed: 'text-yellow-500'
};