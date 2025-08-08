'use client';

import { useState, useEffect, useMemo } from 'react';
import MatchCalendar from '@/components/matches/MatchCalendar';
import MatchCard from '@/components/matches/MatchCard';
import MatchList from '@/components/matches/MatchList';
import { generateMatchesForMonth } from '@/lib/utils/matchData';
import { Match, SportType, sportTypeLabels, sportTypeIcons } from '@/types/match.types';

export default function MatchesPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [matches, setMatches] = useState<Map<string, Match[]>>(new Map());
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list'); // 뷰 모드 추가
  
  // API에서 실제 데이터 가져오기
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/matches?year=${currentMonth.year}&month=${currentMonth.month}`);
        const result = await response.json();
        
        if (result.success) {
          // Convert object back to Map
          const matchMap = new Map<string, Match[]>();
          Object.entries(result.data).forEach(([key, value]) => {
            matchMap.set(key, value as Match[]);
          });
          setMatches(matchMap);
        } else {
          console.error('Failed to fetch matches:', result.error);
          // Fallback to dummy data if API fails
          const generatedMatches = generateMatchesForMonth(currentMonth.year, currentMonth.month - 1);
          setMatches(generatedMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        // Fallback to dummy data if request fails
        const generatedMatches = generateMatchesForMonth(currentMonth.year, currentMonth.month - 1);
        setMatches(generatedMatches);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentMonth.year, currentMonth.month]);
  
  // 선택된 날짜의 경기 목록
  const selectedDateMatches = useMemo(() => {
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dayMatches = matches.get(dateKey) || [];
    
    if (selectedSport === 'all') {
      return dayMatches;
    }
    
    return dayMatches.filter(match => match.sportType === selectedSport);
  }, [selectedDate, matches, selectedSport]);
  
  // 스포츠 종목별 경기 수
  const sportCounts = useMemo(() => {
    const counts: Record<SportType | 'all', number> = {
      all: selectedDateMatches.length,
      football: 0,
      baseball: 0,
      basketball: 0,
      esports: 0,
      volleyball: 0,
    };
    
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dayMatches = matches.get(dateKey) || [];
    
    dayMatches.forEach(match => {
      counts[match.sportType]++;
    });
    
    return counts;
  }, [selectedDate, matches]);
  
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">경기 일정</h1>
          <p className="text-gray-400">실시간 스포츠 경기 정보와 채팅방 입장</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 달력 */}
          <div className="lg:col-span-1">
            <MatchCalendar
              matches={matches}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onMonthChange={(year, month) => setCurrentMonth({ year, month })}
            />
            
            {/* 스포츠 종목 필터 */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">종목별 필터</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSport('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedSport === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <span>전체</span>
                  <span className="text-sm">{sportCounts.all}</span>
                </button>
                
                {(['football', 'baseball', 'basketball', 'esports', 'volleyball'] as SportType[]).map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedSport === sport ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{sportTypeIcons[sport]}</span>
                      <span>{sportTypeLabels[sport]}</span>
                    </span>
                    <span className="text-sm">{sportCounts[sport]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 경기 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">
                    {selectedDate.toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedSport === 'all' ? '전체' : sportTypeLabels[selectedSport]} 경기 {selectedDateMatches.length}개
                  </p>
                </div>
                
                {/* 뷰 모드 전환 버튼 */}
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    title="리스트 뷰"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'card' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    title="카드 뷰"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">경기 정보를 불러오는 중...</p>
                </div>
              </div>
            ) : selectedDateMatches.length > 0 ? (
              viewMode === 'card' ? (
                <div className="space-y-4">
                  {selectedDateMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <MatchList matches={selectedDateMatches} />
              )
            ) : (
              <div className="bg-gray-800 rounded-lg p-16 text-center border border-gray-700">
                <div className="text-6xl mb-4">
                  {selectedSport === 'all' ? '📅' : sportTypeIcons[selectedSport as SportType]}
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">경기가 없습니다</h3>
                <p className="text-gray-400">
                  {selectedDate.toLocaleDateString('ko-KR')}에는{' '}
                  {selectedSport === 'all' ? '' : `${sportTypeLabels[selectedSport as SportType]} `}
                  예정된 경기가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}