import { Match, SportType, MatchStatus, Team } from '@/types/match.types';

// 팀 데이터
const teams: Record<SportType, Team[]> = {
  football: [
    { id: 'fcseoul', name: 'FC 서울', shortName: 'FCSeoul', country: 'KOR' },
    { id: 'suwon', name: '수원 삼성', shortName: 'Suwon', country: 'KOR' },
    { id: 'jeonbuk', name: '전북 현대', shortName: 'Jeonbuk', country: 'KOR' },
    { id: 'ulsan', name: '울산 현대', shortName: 'Ulsan', country: 'KOR' },
    { id: 'pohang', name: '포항 스틸러스', shortName: 'Pohang', country: 'KOR' },
    { id: 'incheon', name: '인천 유나이티드', shortName: 'Incheon', country: 'KOR' },
    { id: 'gangwon', name: '강원 FC', shortName: 'Gangwon', country: 'KOR' },
    { id: 'daegu', name: '대구 FC', shortName: 'Daegu', country: 'KOR' },
  ],
  baseball: [
    { id: 'lg', name: 'LG 트윈스', shortName: 'LG', country: 'KOR' },
    { id: 'kt', name: 'KT 위즈', shortName: 'KT', country: 'KOR' },
    { id: 'ssg', name: 'SSG 랜더스', shortName: 'SSG', country: 'KOR' },
    { id: 'nc', name: 'NC 다이노스', shortName: 'NC', country: 'KOR' },
    { id: 'doosan', name: '두산 베어스', shortName: '두산', country: 'KOR' },
    { id: 'kia', name: 'KIA 타이거즈', shortName: 'KIA', country: 'KOR' },
    { id: 'lotte', name: '롯데 자이언츠', shortName: '롯데', country: 'KOR' },
    { id: 'samsung', name: '삼성 라이온즈', shortName: '삼성', country: 'KOR' },
  ],
  basketball: [
    { id: 'sk', name: '서울 SK', shortName: 'SK', country: 'KOR' },
    { id: 'kgc', name: '안양 KGC', shortName: 'KGC', country: 'KOR' },
    { id: 'lg-basket', name: '창원 LG', shortName: 'LG', country: 'KOR' },
    { id: 'kt-basket', name: '수원 KT', shortName: 'KT', country: 'KOR' },
    { id: 'db', name: '원주 DB', shortName: 'DB', country: 'KOR' },
    { id: 'samsung-basket', name: '서울 삼성', shortName: '삼성', country: 'KOR' },
  ],
  esports: [
    { id: 't1', name: 'T1', shortName: 'T1', country: 'KOR' },
    { id: 'geng', name: 'Gen.G', shortName: 'GEN', country: 'KOR' },
    { id: 'dk', name: 'Dplus KIA', shortName: 'DK', country: 'KOR' },
    { id: 'kt-esports', name: 'KT Rolster', shortName: 'KT', country: 'KOR' },
    { id: 'hle', name: 'Hanwha Life', shortName: 'HLE', country: 'KOR' },
    { id: 'lsb', name: 'Liiv SANDBOX', shortName: 'LSB', country: 'KOR' },
  ],
  volleyball: [
    { id: 'hyundai', name: '대전 현대 스카이워커스', shortName: '현대', country: 'KOR' },
    { id: 'korean-air', name: '인천 대한항공 점보스', shortName: '대한항공', country: 'KOR' },
    { id: 'woori', name: '서울 우리카드 우리WON', shortName: '우리카드', country: 'KOR' },
    { id: 'kb', name: 'KB손해보험 스타즈', shortName: 'KB', country: 'KOR' },
    { id: 'ok', name: '안산 OK저축은행 읏맨', shortName: 'OK', country: 'KOR' },
    { id: 'samsung-volley', name: '대전 삼성화재 블루팡스', shortName: '삼성화재', country: 'KOR' },
  ],
};

const competitions: Record<SportType, string[]> = {
  football: ['K리그1', 'K리그2', 'FA컵', 'AFC 챔피언스리그'],
  baseball: ['KBO 리그', 'KBO 포스트시즌'],
  basketball: ['KBL', 'KBL 플레이오프'],
  esports: ['LCK Spring', 'LCK Summer', 'MSI', 'Worlds'],
  volleyball: ['V-리그'],
};

const venues: Record<SportType, string[]> = {
  football: ['서울월드컵경기장', '수원월드컵경기장', '전주월드컵경기장', '울산문수축구경기장', '포항스틸야드'],
  baseball: ['잠실야구장', '고척스카이돔', 'SSG랜더스필드', '창원NC파크', '광주기아챔피언스필드'],
  basketball: ['잠실학생체육관', '안양체육관', '창원체육관', '수원KT아레나', '원주종합체육관'],
  esports: ['LoL PARK', '그랜드몰 아레나', '온라인'],
  volleyball: ['장충체육관', '계양체육관', '유관순체육관'],
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMatchId(): string {
  return `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getMatchStatus(scheduledTime: Date): MatchStatus {
  const now = new Date();
  const diffInHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < -3) return 'finished';
  if (diffInHours < 0) return 'live';
  if (diffInHours > 24) return Math.random() > 0.9 ? 'postponed' : 'scheduled';
  return 'scheduled';
}

export function generateDummyMatches(date: Date): Match[] {
  const matches: Match[] = [];
  const matchCount = Math.floor(Math.random() * 8) + 3; // 3-10 matches per day
  
  for (let i = 0; i < matchCount; i++) {
    const sportType = getRandomItem<SportType>(['football', 'baseball', 'basketball', 'esports', 'volleyball']);
    const sportTeams = teams[sportType];
    const homeTeam = getRandomItem(sportTeams);
    let awayTeam = getRandomItem(sportTeams);
    
    // Ensure different teams
    while (awayTeam.id === homeTeam.id) {
      awayTeam = getRandomItem(sportTeams);
    }
    
    const hour = Math.floor(Math.random() * 14) + 10; // 10:00 - 23:00
    const minute = Math.random() > 0.5 ? 0 : 30;
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hour, minute, 0, 0);
    
    const status = getMatchStatus(scheduledTime);
    const match: Match = {
      id: generateMatchId(),
      sportType,
      status,
      homeTeam,
      awayTeam,
      scheduledTime,
      competition: getRandomItem(competitions[sportType]),
      venue: getRandomItem(venues[sportType]),
      hasChat: true,
      viewerCount: status === 'live' ? Math.floor(Math.random() * 5000) + 100 : undefined,
    };
    
    // Add scores for live or finished matches
    if (status === 'live' || status === 'finished') {
      if (sportType === 'football' || sportType === 'volleyball') {
        match.homeScore = Math.floor(Math.random() * 4);
        match.awayScore = Math.floor(Math.random() * 4);
      } else if (sportType === 'baseball') {
        match.homeScore = Math.floor(Math.random() * 10);
        match.awayScore = Math.floor(Math.random() * 10);
      } else if (sportType === 'basketball') {
        match.homeScore = Math.floor(Math.random() * 30) + 70;
        match.awayScore = Math.floor(Math.random() * 30) + 70;
      } else if (sportType === 'esports') {
        match.homeScore = Math.floor(Math.random() * 3);
        match.awayScore = Math.floor(Math.random() * 3);
      }
      
      if (status === 'live') {
        match.actualStartTime = new Date(scheduledTime.getTime() - Math.random() * 60 * 60 * 1000);
        if (sportType === 'football') {
          match.currentMinute = Math.floor(Math.random() * 90) + 1;
        }
      } else if (status === 'finished') {
        match.actualStartTime = new Date(scheduledTime.getTime() - 2 * 60 * 60 * 1000);
        match.actualEndTime = new Date(scheduledTime.getTime());
      }
    }
    
    matches.push(match);
  }
  
  // Sort by scheduled time
  return matches.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
}

export function generateMatchesForMonth(year: number, month: number): Map<string, Match[]> {
  const matchesByDate = new Map<string, Match[]>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 70% chance of having matches on any given day
    if (Math.random() > 0.3) {
      matchesByDate.set(dateKey, generateDummyMatches(date));
    }
  }
  
  return matchesByDate;
}