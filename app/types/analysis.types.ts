export type AnalysisStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type BetType = 
  | 'match_result'    // 승무패
  | 'handicap'        // 핸디캡
  | 'over_under'      // 오버/언더
  | 'both_score'      // 양팀득점
  | 'correct_score'   // 정확한 스코어
  | 'first_goal'      // 첫 득점
  | 'half_time'       // 전반전 결과
  | 'special';        // 특별 베팅

export type PredictionResult = 'pending' | 'correct' | 'incorrect' | 'partial' | 'cancelled';

export interface AnalystProfile {
  id: number;
  userId: number;
  displayName: string;
  profileImage?: string;
  specialties: string[];
  description?: string;
  experience?: string;
  certification?: string;
  totalPredictions: number;
  correctPredictions: number;
  averageAccuracy?: number;
  monthlyRanking?: number;
  totalViews: number;
  totalLikes: number;
  isVerified: boolean;
  verifiedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    username: string;
    level: number;
  };
}

export interface SportAnalysis {
  id: number;
  authorId: number;
  matchDate: Date;
  sportType: string;
  league: string;
  competition?: string;
  homeTeam: string;
  awayTeam: string;
  
  // SEO fields
  title: string;
  slug: string;
  metaDescription?: string;
  metaKeywords: string[];
  
  // Analysis content
  homeFormation?: string;
  awayFormation?: string;
  homeAnalysis: string;
  awayAnalysis: string;
  tacticalAnalysis?: string;
  keyPlayers?: {
    home: Array<{ name: string; position: string; status: string }>;
    away: Array<{ name: string; position: string; status: string }>;
  };
  injuryInfo?: {
    home: string[];
    away: string[];
  };
  headToHead?: {
    totalGames: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    recentMatches: Array<{
      date: string;
      homeTeam: string;
      awayTeam: string;
      score: string;
    }>;
  };
  recentForm?: {
    home: string; // "WWDLW" 형식
    away: string; // "LLWDW" 형식
  };
  
  // Predictions
  predictionSummary: string;
  confidenceLevel: number;
  
  // Statistics
  views: number;
  likes: number;
  commentsCount: number;
  
  // Status
  status: AnalysisStatus;
  isPublished: boolean;
  publishedAt?: Date;
  isPinned: boolean;
  
  // Results
  actualHomeScore?: number;
  actualAwayScore?: number;
  predictionResult?: PredictionResult;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  author?: AnalystProfile;
  predictions?: AnalysisPrediction[];
  comments?: AnalysisComment[];
}

export interface AnalysisPrediction {
  id: number;
  analysisId: number;
  authorId: number;
  betType: BetType;
  prediction: string;
  odds?: number;
  stake?: number;
  reasoning: string;
  result?: PredictionResult;
  createdAt: Date;
}

export interface AnalysisComment {
  id: number;
  analysisId: number;
  userId: number;
  parentId?: number;
  content: string;
  likes: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    username: string;
    level: number;
    profileImage?: string;
  };
  replies?: AnalysisComment[];
}

// DTOs for API requests/responses
export interface CreateAnalysisDto {
  matchDate: string;
  sportType: string;
  league: string;
  competition?: string;
  homeTeam: string;
  awayTeam: string;
  title: string;
  metaDescription?: string;
  metaKeywords?: string[];
  homeFormation?: string;
  awayFormation?: string;
  homeAnalysis: string;
  awayAnalysis: string;
  tacticalAnalysis?: string;
  keyPlayers?: any;
  injuryInfo?: any;
  headToHead?: any;
  recentForm?: any;
  predictionSummary: string;
  confidenceLevel: number;
  predictions: Array<{
    betType: BetType;
    prediction: string;
    odds?: number;
    stake?: number;
    reasoning: string;
  }>;
}

export interface UpdateAnalysisDto extends Partial<CreateAnalysisDto> {
  status?: AnalysisStatus;
  isPublished?: boolean;
}

export interface AnalysisListResponse {
  analyses: SportAnalysis[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnalysisFilters {
  sportType?: string;
  league?: string;
  authorId?: number;
  status?: AnalysisStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AnalysisSortOptions {
  sortBy?: 'date' | 'views' | 'likes' | 'accuracy';
  sortOrder?: 'asc' | 'desc';
}

// SEO related types
export interface AnalysisSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage?: string;
  structuredData: {
    '@context': string;
    '@type': string;
    headline: string;
    description: string;
    datePublished: string;
    dateModified: string;
    author: {
      '@type': string;
      name: string;
      url?: string;
    };
    publisher: {
      '@type': string;
      name: string;
      logo?: {
        '@type': string;
        url: string;
      };
    };
    mainEntityOfPage: {
      '@type': string;
      '@id': string;
    };
    image?: string[];
  };
}