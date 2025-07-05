'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiBookOpen, FiCalendar, FiArrowRight, FiBook } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

interface FeaturedBannerProps {
  manga: Manga;
  onClick?: () => void;
  className?: string;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ 
  manga, 
  onClick, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCoverUrl = async () => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      if (coverArt?.attributes?.fileName) {
        const url = mangaDexService.getCoverUrl(manga.id, coverArt.attributes.fileName, 'large');
        setCoverUrl(url);
      }
    };

    loadCoverUrl();
  }, [manga]);

  const title = manga.attributes.title.en || 
               manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
               'Sin título';

  const description = manga.attributes.description?.en || 
                     manga.attributes.description?.[Object.keys(manga.attributes.description)[0]] || 
                     'Sin descripción disponible';

  const truncatedDescription = description.length > 300 
    ? description.substring(0, 300) + '...' 
    : description;

  const genres = manga.attributes.tags
    ?.filter(tag => tag.attributes.group === 'genre')
    .slice(0, 5)
    .map(tag => tag.attributes.name.en) || [];

  const publicationYear = manga.attributes.year || 'N/A';
  const status = manga.attributes.status || 'unknown';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'En curso';
      case 'completed': return 'Completado';
      case 'hiatus': return 'En pausa';
      case 'cancelled': return 'Cancelado';
      default: return 'Estado desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'hiatus': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        {coverUrl && !imageError ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover blur-sm"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600"></div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Cover Image */}
          <div className="relative w-48 h-64 md:w-56 md:h-72 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden shadow-2xl">
            {coverUrl && !imageError ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiBook className="w-16 h-16 text-slate-500" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {title}
              </h1>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-slate-300">
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>{publicationYear}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiBookOpen className="w-4 h-4" />
                  <span className={getStatusColor(status)}>{getStatusText(status)}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
              {truncatedDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={onClick}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <FiBookOpen className="w-5 h-5" />
                <span>Leer Ahora</span>
              </button>
              <button
                onClick={onClick}
                className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <FiArrowRight className="w-5 h-5" />
                <span>Ver Detalles</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner; 