'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Partner {
  id: number;
  name: string;
  bannerImage?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  rating?: number;
}

interface PartnerBannersProps {
  partners: Partner[];
  position: 'left' | 'right' | 'mobile';
}

export default function PartnerBanners({ partners, position }: PartnerBannersProps) {
  // 모바일에서는 모든 파트너 표시, 데스크톱에서는 반반 나누기
  let displayPartners = partners;
  
  if (position === 'left') {
    // 왼쪽: 홀수 인덱스 파트너
    displayPartners = partners.filter((_, index) => index % 2 === 0);
  } else if (position === 'right') {
    // 오른쪽: 짝수 인덱스 파트너
    displayPartners = partners.filter((_, index) => index % 2 === 1);
  }

  if (displayPartners.length === 0) {
    return null;
  }

  // 모바일 레이아웃 (수평 스크롤)
  if (position === 'mobile') {
    return (
      <div className="w-full bg-gray-800 border-b border-gray-700 py-4">
        <div className="px-4 mb-3">
          <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <span>🏆</span>
            공식 보증 파트너
          </h3>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 pb-2">
            {displayPartners.map((partner) => (
              <Link
                key={partner.id}
                href={partner.websiteUrl || `/partners/${partner.id}`}
                target={partner.websiteUrl ? '_blank' : undefined}
                rel={partner.websiteUrl ? 'noopener noreferrer' : undefined}
                className="flex-shrink-0 w-40 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border border-gray-600 hover:border-yellow-600 transition-all overflow-hidden"
              >
                <div className="p-3">
                  {/* 로고/이미지 */}
                  {partner.bannerImage ? (
                    <div className="relative h-20 mb-2 bg-gray-900 rounded">
                      <Image
                        src={partner.bannerImage}
                        alt={partner.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="h-20 mb-2 bg-gray-900 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {partner.name[0]}
                      </span>
                    </div>
                  )}

                  {/* 파트너 정보 */}
                  <h4 className="font-semibold text-sm text-gray-100 truncate">
                    {partner.name}
                  </h4>

                  {/* 평점 */}
                  {partner.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(partner.rating!) ? 'text-yellow-400' : 'text-gray-600'}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        {partner.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 데스크톱 사이드바 레이아웃
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 px-2">
        <span>🏆</span>
        보증 파트너
      </h3>
      
      {displayPartners.map((partner) => (
        <Link
          key={partner.id}
          href={partner.websiteUrl || `/partners/${partner.id}`}
          target={partner.websiteUrl ? '_blank' : undefined}
          rel={partner.websiteUrl ? 'noopener noreferrer' : undefined}
          className="block bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-yellow-600 transition-all overflow-hidden group"
        >
          {/* 배너 이미지 */}
          {partner.bannerImage ? (
            <div className="relative h-32 bg-gray-900">
              <Image
                src={partner.bannerImage}
                alt={partner.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <h4 className="font-bold text-white text-lg shadow-lg">
                  {partner.name}
                </h4>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-600">
                {partner.name[0]}
              </span>
            </div>
          )}

          {/* 파트너 정보 */}
          <div className="p-4">
            {partner.description && (
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {partner.description}
              </p>
            )}


            {/* 평점 */}
            {partner.rating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < Math.floor(partner.rating!) ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {partner.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* CTA 버튼 */}
            <div className="mt-4">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-center py-2 rounded-md text-sm font-semibold group-hover:from-yellow-500 group-hover:to-orange-500 transition-colors">
                가입하기
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}