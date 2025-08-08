'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Notice {
  id: number;
  title: string;
  createdAt: Date;
  user: {
    username: string;
  };
}

interface NoticesProps {
  notices: Notice[];
}

export default function Notices({ notices }: NoticesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (notices.length === 0) {
    return null;
  }

  const displayNotices = isExpanded ? notices : notices.slice(0, 2);

  return (
    <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-800/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-yellow-400 text-lg">📢</span>
        <h3 className="font-semibold text-yellow-400">공지사항</h3>
      </div>
      
      <div className="space-y-2">
        {displayNotices.map((notice) => (
          <Link
            key={notice.id}
            href={`/posts/${notice.id}`}
            className="block group"
          >
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-sm mt-0.5">•</span>
              <div className="flex-1">
                <p className="text-sm text-gray-200 group-hover:text-yellow-300 transition-colors">
                  {notice.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notice.user.username} · {formatDate(new Date(notice.createdAt))}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {notices.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs text-yellow-600 hover:text-yellow-400 transition-colors"
        >
          {isExpanded ? '접기' : `${notices.length - 2}개 더 보기`}
        </button>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
}