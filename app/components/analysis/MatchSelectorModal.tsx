'use client';

import { useState, useEffect, useMemo } from 'react';
import { Match } from '@/types/match.types';
import MatchCalendar from '@/components/matches/MatchCalendar';
import { sportTypeIcons, sportTypeLabels } from '@/types/match.types';

interface MatchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (match: Match) => void;
}

export default function MatchSelectorModal({ 
  isOpen, 
  onClose, 
  onSelectMatch 
}: MatchSelectorModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 
  });
  const [matches, setMatches] = useState<Map<string, Match[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Fetch matches when month changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/matches?year=${currentMonth.year}&month=${currentMonth.month}`
        );
        const result = await response.json();
        
        if (result.success) {
          const matchMap = new Map<string, Match[]>();
          Object.entries(result.data).forEach(([key, value]) => {
            matchMap.set(key, value as Match[]);
          });
          setMatches(matchMap);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentMonth, isOpen]);

  // Get matches for selected date
  const selectedDateMatches = useMemo(() => {
    const dateKey = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return matches.get(dateKey) || [];
  }, [selectedDate, matches]);

  // Group matches by sport type
  const matchesBySport = useMemo(() => {
    const grouped = new Map<string, Match[]>();
    selectedDateMatches.forEach(match => {
      const sport = match.sportType;
      if (!grouped.has(sport)) {
        grouped.set(sport, []);
      }
      grouped.get(sport)!.push(match);
    });
    return grouped;
  }, [selectedDateMatches]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth({ year, month });
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    onSelectMatch(match);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100">
              분석할 경기 선택
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex h-[600px]">
            {/* Left: Calendar */}
            <div className="w-1/2 p-6 border-r border-gray-700 overflow-y-auto">
              <MatchCalendar
                matches={matches}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onMonthChange={handleMonthChange}
              />
            </div>

            {/* Right: Match List */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })} 경기
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : selectedDateMatches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">선택한 날짜에 경기가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(matchesBySport.entries()).map(([sportType, sportMatches]) => (
                    <div key={sportType}>
                      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <span className="text-lg">
                          {sportTypeIcons[sportType as keyof typeof sportTypeIcons]}
                        </span>
                        <span>
                          {sportMatches[0]?.competition || sportTypeLabels[sportType as keyof typeof sportTypeLabels]}
                        </span>
                      </h4>
                      
                      <div className="space-y-2">
                        {sportMatches.map(match => (
                          <button
                            key={match.id}
                            onClick={() => handleMatchSelect(match)}
                            className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-100">
                                  {match.homeTeam.name}
                                </span>
                                <span className="text-gray-400 text-sm">vs</span>
                                <span className="font-medium text-gray-100">
                                  {match.awayTeam.name}
                                </span>
                              </div>
                              <span className="text-sm text-gray-400">
                                {new Date(match.scheduledTime).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {match.venue && (
                              <div className="text-xs text-gray-500">
                                📍 {match.venue}
                              </div>
                            )}
                            
                            {match.round && (
                              <div className="text-xs text-gray-500 mt-1">
                                {match.round}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}