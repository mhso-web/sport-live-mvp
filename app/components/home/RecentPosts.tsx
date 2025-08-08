'use client';

import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  views: number;
  createdAt: Date;
  user: {
    username: string;
    level: number;
  };
  _count: {
    comments: number;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
}

interface RecentPostsProps {
  categories: Array<{
    category: Category;
    posts: Post[];
  }>;
}

export default function RecentPosts({ categories }: RecentPostsProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">표시할 게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {categories.map(({ category, posts }) => (
        <div key={category.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {/* 카테고리 헤더 */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 flex items-center justify-between">
            <Link 
              href={`/boards/${category.slug}`}
              className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
            >
              {category.icon && (
                <span className="text-lg">{category.icon}</span>
              )}
              <h3 className="font-semibold text-gray-100">
                {category.name}
              </h3>
            </Link>
            <Link 
              href={`/boards/${category.slug}`}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              더보기 →
            </Link>
          </div>

          {/* 게시글 목록 */}
          <div className="divide-y divide-gray-700">
            {posts.length === 0 ? (
              <div className="px-4 py-3 text-center">
                <p className="text-sm text-gray-500">아직 게시글이 없습니다.</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block px-4 py-3 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{post.user.username}</span>
                        <span>Lv.{post.user.level}</span>
                        <span>조회 {post.views}</span>
                        {post._count.comments > 0 && (
                          <span className="text-yellow-500">
                            댓글 {post._count.comments}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      {formatDate(new Date(post.createdAt))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
}