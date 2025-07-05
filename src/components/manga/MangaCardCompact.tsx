'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiHeart, FiEye, FiClock } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import { mangaDexService } from '@/services/mangadex';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import type { Manga } from '@/types/manga';

interface MangaCardCompactProps {
  manga: Manga;
  variant?: 'grid' | 'list';
}

export function MangaCardCompact({ manga, variant = 'grid' }: MangaCardCompactProps) {
  const { addToFavorites, favorites } = useMangaStore();
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Obtener información del manga
  const title = manga.attributes.title.en || 
               manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
               'Sin título';
  
  // const description = manga.attributes.description.en || 
  //                    manga.attributes.description[Object.keys(manga.attributes.description)[0]] || 
  //                    '';

  // Obtener cover art
  const coverRelation = manga.relationships.find(rel => rel.type === 'cover_art');
  
  // Cargar la URL de la portada de manera asíncrona
  useEffect(() => {
    const loadCoverUrl = async () => {
      if (coverRelation?.id) {
        try {
          const coverInfo = await mangaDexService.getCoverArt(coverRelation.id);
          if (coverInfo?.fileName) {
            const url = mangaDexService.getCoverUrl(manga.id, coverInfo.fileName, 'medium');
            setCoverUrl(url);
          }
        } catch (error) {
          console.error('Error loading cover:', error);
          setImageError(true);
        }
      }
    };
    
    loadCoverUrl();
  }, [manga.id, coverRelation?.id]);

  // Verificar si está en favoritos
  const isFavorite = favorites.some(fav => fav.id === manga.id);

  // Obtener tags principales
  const mainTags = manga.attributes.tags.slice(0, 2).map(tag => 
    tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]
  );

  // Variables adicionales para móvil
  const rating = manga.attributes.year || 0; // Simulando rating con año por ahora
  const status = manga.attributes.status;
  const tags = mainTags;
  const lastUpdate = new Date();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'En curso';
      case 'completed': return 'Completado';
      case 'hiatus': return 'En pausa';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'hiatus': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}s`;
    return `${Math.floor(diffInDays / 30)}m`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToFavorites(manga, 'plan-to-read');
  };

  const handleStatusClick = (e: React.MouseEvent, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToFavorites(manga, status as 'plan-to-read' | 'reading' | 'completed' | 'dropped');
  };

  const renderListView = () => (
    <div className="group">
      <Link href={`/manga/${manga.id}`} className="block">
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
          {/* Mobile Optimized Cover Image */}
          <div className="relative w-12 h-16 sm:w-16 sm:h-20 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
            {coverUrl && !imageError ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="64px"
                onError={() => setImageError(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {/* Mobile Optimized Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm sm:text-base line-clamp-1 group-hover:text-purple-300 transition-colors">
              {title}
            </h3>
            
            {/* Mobile Optimized Meta Info */}
            <div className="flex items-center space-x-1 sm:space-x-2 mt-1 text-xs text-slate-400">
              {/* Rating */}
              {rating && (
                <div className="flex items-center space-x-1">
                  <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              
              {/* Status */}
              {status && (
                <span className={`px-1 sm:px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              )}
            </div>

            {/* Tags - Hidden on very small screens */}
            {tags.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1 mt-1">
                {tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Optimized Actions */}
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button
              onClick={(e) => handleFavoriteClick(e)}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => handleStatusClick(e, 'reading')}
              className="p-1.5 sm:p-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-full transition-colors"
              title="Marcar como leyendo"
            >
              <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );

  const renderGridView = () => (
    <div className="group h-full">
      <Link href={`/manga/${manga.id}`} className="block h-full">
        <div className="bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-2 sm:p-3 transition-all duration-200 hover:scale-105 h-full flex flex-col">
          {/* Mobile Optimized Cover Image */}
          <div className="relative aspect-[3/4.5] bg-slate-700 mb-2 sm:mb-3 rounded overflow-hidden">
            {coverUrl && !imageError ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={() => setImageError(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            ) : (
              <ImagePlaceholder />
            )}

            {/* Mobile Optimized Overlay Actions */}
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex flex-col space-y-1">
              <button
                onClick={(e) => handleFavoriteClick(e)}
                className={`p-1 sm:p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite
                    ? 'bg-red-500/80 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Rating Badge */}
            {rating && (
              <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Mobile Optimized Content */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-medium text-white text-xs sm:text-sm line-clamp-2 group-hover:text-purple-300 transition-colors mb-1 sm:mb-2">
              {title}
            </h3>

            {/* Mobile Optimized Meta */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 sm:mb-2">
              {/* Status */}
              {status && (
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              )}

              {/* Last Update */}
              {lastUpdate && (
                <div className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>{formatLastUpdate(lastUpdate)}</span>
                </div>
              )}
            </div>

            {/* Mobile Optimized Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {tags.slice(0, variant === 'grid' ? 2 : 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );

  if (variant === 'list') {
    return renderListView();
  }

  // Grid variant (default)
  return renderGridView();
} 