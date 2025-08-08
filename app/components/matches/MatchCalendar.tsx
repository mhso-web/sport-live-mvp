'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/types/match.types';

interface MatchCalendarProps {
  matches: Map<string, Match[]>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export default function MatchCalendar({ matches, selectedDate, onDateSelect, onMonthChange }: MatchCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }, [currentMonth]);
  
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth.getFullYear(), newMonth.getMonth() + 1);
  };
  
  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth.getFullYear(), newMonth.getMonth() + 1);
  };
  
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };
  
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-100">
            {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
          </h2>
          <button
            onClick={handleToday}
            className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            오늘
          </button>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-1 ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dateKey = getDateKey(date);
          const dayMatches = matches.get(dateKey) || [];
          const hasMatches = dayMatches.length > 0;
          const hasLiveMatch = dayMatches.some(m => m.status === 'live');
          const dayOfWeek = date.getDay();
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              disabled={!isCurrentMonth(date)}
              className={`
                relative h-14 p-1 rounded-lg transition-all
                ${!isCurrentMonth(date) ? 'opacity-30 cursor-default' : 'hover:bg-gray-700'}
                ${isSelected(date) ? 'bg-blue-600 hover:bg-blue-700' : ''}
                ${isToday(date) && !isSelected(date) ? 'bg-gray-700' : ''}
              `}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <span className={`
                    text-sm font-medium
                    ${!isCurrentMonth(date) ? 'text-gray-600' : 
                      dayOfWeek === 0 ? 'text-red-400' : 
                      dayOfWeek === 6 ? 'text-blue-400' : 
                      'text-gray-200'}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {isToday(date) && (
                    <span className="text-[10px] text-yellow-400 font-medium">오늘</span>
                  )}
                </div>
                
                {hasMatches && isCurrentMonth(date) && (
                  <div className="mt-auto">
                    <div className="flex items-center justify-center gap-0.5">
                      {hasLiveMatch && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {dayMatches.length}경기
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 선택된 날짜 정보 */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            선택된 날짜: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </span>
          <span className="text-xs text-gray-300 font-medium">
            {matches.get(getDateKey(selectedDate))?.length || 0}개의 경기
          </span>
        </div>
      </div>
    </div>
  );
}