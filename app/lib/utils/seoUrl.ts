import slugify from 'slugify';

/**
 * SEO URL Generation Utilities
 * Generates hierarchical URLs for sports analysis pages
 */

interface SeoUrlParams {
  sport: {
    slug: string;
  };
  league: {
    slug: string;
  };
  matchDate: Date | string;
  homeTeam: {
    slug: string;
  };
  awayTeam: {
    slug: string;
  };
}

interface SimpleSeoUrlParams {
  sportSlug: string;
  leagueSlug: string;
  matchDate: Date | string;
  homeTeamSlug: string;
  awayTeamSlug: string;
}

/**
 * Generate SEO-optimized hierarchical URL for analysis
 * Format: /analysis/{sport}/{league}/{year}/{month}/{homeTeam}-vs-{awayTeam}
 * Example: /analysis/soccer/premier-league/2025/08/liverpool-vs-bournemouth
 */
export function generateAnalysisSeoUrl(params: SeoUrlParams | SimpleSeoUrlParams): string {
  const date = new Date(params.matchDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Handle both interface types
  const sportSlug = 'slug' in params.sport ? params.sport.slug : (params as SimpleSeoUrlParams).sportSlug;
  const leagueSlug = 'slug' in params.league ? params.league.slug : (params as SimpleSeoUrlParams).leagueSlug;
  const homeTeamSlug = 'slug' in params.homeTeam ? params.homeTeam.slug : (params as SimpleSeoUrlParams).homeTeamSlug;
  const awayTeamSlug = 'slug' in params.awayTeam ? params.awayTeam.slug : (params as SimpleSeoUrlParams).awayTeamSlug;
  
  return `/analysis/${sportSlug}/${leagueSlug}/${year}/${month}/${homeTeamSlug}-vs-${awayTeamSlug}`;
}

/**
 * Generate SEO-friendly slug from Korean or English text
 */
export function generateSlug(text: string): string {
  // Remove special characters common in team names
  const cleaned = text
    .replace(/FC|F\.C\.|SC|S\.C\.|AC|A\.C\.|CF|C\.F\./gi, '')
    .trim();
  
  return slugify(cleaned, {
    lower: true,
    strict: true,
    locale: 'en'
  });
}

/**
 * Generate sport slug from SportType enum or string
 */
export function generateSportSlug(sportType: string): string {
  const sportMap: Record<string, string> = {
    'SOCCER': 'soccer',
    'soccer': 'soccer',
    '축구': 'soccer',
    'football': 'soccer',
    
    'BASEBALL': 'baseball',
    'baseball': 'baseball',
    '야구': 'baseball',
    
    'BASKETBALL': 'basketball',
    'basketball': 'basketball',
    '농구': 'basketball',
    
    'ESPORTS': 'esports',
    'esports': 'esports',
    'e스포츠': 'esports',
    'e-sports': 'esports',
    
    'VOLLEYBALL': 'volleyball',
    'volleyball': 'volleyball',
    '배구': 'volleyball',
    
    'TENNIS': 'tennis',
    'tennis': 'tennis',
    '테니스': 'tennis',
    
    'GOLF': 'golf',
    'golf': 'golf',
    '골프': 'golf',
  };
  
  return sportMap[sportType] || slugify(sportType, { lower: true, strict: true });
}

/**
 * Generate league slug from league name
 */
export function generateLeagueSlug(leagueName: string): string {
  // Common league name mappings
  const leagueMap: Record<string, string> = {
    'Premier League': 'premier-league',
    '프리미어리그': 'premier-league',
    'EPL': 'premier-league',
    
    'La Liga': 'la-liga',
    '라리가': 'la-liga',
    
    'Serie A': 'serie-a',
    '세리에A': 'serie-a',
    
    'Bundesliga': 'bundesliga',
    '분데스리가': 'bundesliga',
    
    'Ligue 1': 'ligue-1',
    '리그1': 'ligue-1',
    
    'K리그1': 'k-league-1',
    'K League 1': 'k-league-1',
    'K리그 클래식': 'k-league-1',
    
    'K리그2': 'k-league-2',
    'K League 2': 'k-league-2',
    
    'MLB': 'mlb',
    'Major League Baseball': 'mlb',
    '메이저리그': 'mlb',
    
    'KBO': 'kbo',
    'KBO 리그': 'kbo',
    'Korean Baseball Organization': 'kbo',
    
    'NBA': 'nba',
    'National Basketball Association': 'nba',
    
    'KBL': 'kbl',
    'Korean Basketball League': 'kbl',
    '한국프로농구': 'kbl',
  };
  
  // Check if we have a predefined mapping
  const mapped = leagueMap[leagueName];
  if (mapped) return mapped;
  
  // Otherwise generate slug from the name
  return slugify(leagueName, {
    lower: true,
    strict: true,
    locale: 'en'
  });
}

/**
 * Generate team slug from team name
 */
export function generateTeamSlug(teamName: string): string {
  // Remove common suffixes and generate slug
  const cleaned = teamName
    .replace(/FC|F\.C\.|SC|S\.C\.|AC|A\.C\.|CF|C\.F\.|United|City|Town|Athletic|Atletico|Sporting|Real/gi, '')
    .trim();
  
  if (!cleaned) {
    // If everything was removed, use the original
    return slugify(teamName, { lower: true, strict: true });
  }
  
  return slugify(cleaned, {
    lower: true,
    strict: true,
    locale: 'en'
  });
}

/**
 * Parse SEO URL back into components
 * /analysis/soccer/premier-league/2025/08/liverpool-vs-bournemouth
 */
export function parseSeoUrl(url: string): {
  sport: string;
  league: string;
  year: string;
  month: string;
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
} | null {
  const pattern = /^\/analysis\/([^\/]+)\/([^\/]+)\/(\d{4})\/(\d{2})\/([^\/]+)$/;
  const match = url.match(pattern);
  
  if (!match) return null;
  
  const [, sport, league, year, month, matchSlug] = match;
  const [homeTeam, awayTeam] = matchSlug.split('-vs-');
  
  return {
    sport,
    league,
    year,
    month,
    matchSlug,
    homeTeam,
    awayTeam
  };
}

/**
 * Generate breadcrumb items from SEO URL
 */
export function generateBreadcrumbs(url: string): Array<{ label: string; href: string }> {
  const parsed = parseSeoUrl(url);
  if (!parsed) return [];
  
  return [
    { label: '홈', href: '/' },
    { label: '경기 분석', href: '/analysis' },
    { label: getSportLabel(parsed.sport), href: `/analysis/${parsed.sport}` },
    { label: getLeagueLabel(parsed.league), href: `/analysis/${parsed.sport}/${parsed.league}` },
    { label: `${parsed.year}년 ${parsed.month}월`, href: `/analysis/${parsed.sport}/${parsed.league}/${parsed.year}/${parsed.month}` },
  ];
}

/**
 * Get display label for sport slug
 */
function getSportLabel(slug: string): string {
  const labels: Record<string, string> = {
    'soccer': '축구',
    'baseball': '야구',
    'basketball': '농구',
    'esports': 'e스포츠',
    'volleyball': '배구',
    'tennis': '테니스',
    'golf': '골프',
  };
  return labels[slug] || slug;
}

/**
 * Get display label for league slug
 */
function getLeagueLabel(slug: string): string {
  const labels: Record<string, string> = {
    'premier-league': '프리미어리그',
    'la-liga': '라리가',
    'serie-a': '세리에A',
    'bundesliga': '분데스리가',
    'ligue-1': '리그1',
    'k-league-1': 'K리그1',
    'k-league-2': 'K리그2',
    'mlb': 'MLB',
    'kbo': 'KBO',
    'nba': 'NBA',
    'kbl': 'KBL',
  };
  return labels[slug] || slug;
}

/**
 * Generate canonical URL for SEO
 */
export function generateCanonicalUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://sportslive.com';
  return `${base}${path}`;
}

/**
 * Generate alternate language URLs for hreflang tags
 */
export function generateAlternateUrls(path: string, languages: string[] = ['ko', 'en']): Array<{ lang: string; url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sportslive.com';
  
  return languages.map(lang => ({
    lang,
    url: `${baseUrl}/${lang}${path}`
  }));
}