'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiBook, FiClock, FiUser } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

interface LatestUpdateItemProps {
  manga: Manga;
  latestChapter?: {
    id: string;
    volume?: string;
    chapter: string;
    title?: string;
    publishAt: string;
    scanlationGroup?: string;
  };
  onClick?: () => void;
  className?: string;
}

const LatestUpdateItem: React.FC<LatestUpdateItemProps> = ({ 
  manga, 
  latestChapter, 
  onClick, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCoverUrl = async () => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      if (coverArt?.attributes?.fileName) {
        const url = mangaDexService.getCoverUrl(manga.id, coverArt.attributes.fileName, 'small');
        setCoverUrl(url);
      }
    };

    loadCoverUrl();
  }, [manga]);

  const title = manga.attributes.title.en || 
               manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
               'Sin título';

  const timeAgo = (date: string) => {
    const now = new Date();
    const publishDate = new Date(date);
    const diff = now.getTime() - publishDate.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutos`;
    if (hours < 24) return `${hours} horas`;
    return `${days} días`;
  };

  return (
    <div 
      className={`flex items-center space-x-4 p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative w-16 h-20 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
        {coverUrl && !imageError ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBook className="w-6 h-6 text-slate-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Manga Title */}
            <h3 className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
              {title}
            </h3>
            
            {/* Chapter Info */}
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-slate-300 text-sm">
                {latestChapter?.volume && `Vol. ${latestChapter.volume} `}
                Ch. {latestChapter?.chapter}
                {latestChapter?.title && ` - ${latestChapter.title}`}
              </span>
            </div>

            {/* Scanlation Group */}
            {latestChapter?.scanlationGroup && (
              <div className="flex items-center space-x-1 mt-1">
                <FiUser className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 text-xs truncate">
                  {latestChapter.scanlationGroup}
                </span>
              </div>
            )}
          </div>

          {/* Time Ago */}
          <div className="flex items-center space-x-1 text-slate-400 text-xs ml-4 flex-shrink-0">
            <FiClock className="w-3 h-3" />
            <span>{latestChapter ? timeAgo(latestChapter.publishAt) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestUpdateItem; 