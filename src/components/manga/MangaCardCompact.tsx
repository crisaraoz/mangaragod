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
  const [isHovered, setIsHovered] = useState(false);

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

  // Obtener autor
  const author = manga.relationships.find(rel => rel.type === 'author');
  const authorName = author?.attributes?.name || 'Autor desconocido';

  // Verificar si está en favoritos
  const isFavorite = favorites.some(fav => fav.id === manga.id);

  // Obtener tags principales
  const mainTags = manga.attributes.tags.slice(0, 2).map(tag => 
    tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]
  );

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToFavorites(manga, 'plan-to-read');
  };

  if (variant === 'list') {
    return (
      <Link href={`/manga/${manga.id}`}>
        <div 
          className="flex items-center space-x-4 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cover Image */}
          <div className="relative w-16 h-20 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
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
              <ImagePlaceholder 
                showError={imageError}
                size="sm"
                className="w-full h-full rounded-none"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate mb-1">
              {title}
            </h3>
            <p className="text-slate-400 text-xs mb-2">
              Por {authorName}
            </p>
            <div className="flex items-center space-x-2">
              {mainTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center space-x-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleAddToFavorites}
              className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
              title="Agregar a favoritos"
            >
              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link href={`/manga/${manga.id}`}>
      <div 
        className="group relative bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
                  {/* Cover Image */}
          <div className="relative aspect-[3/4.5] bg-slate-700">
            {coverUrl && !imageError ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={() => setImageError(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
                          ) : (
                <ImagePlaceholder 
                  showError={imageError}
                  title={title}
                  size="lg"
                  className="w-full h-full rounded-none"
                />
              )}
          
          {/* Quick Actions Overlay */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex space-x-2">
              <button
                onClick={handleAddToFavorites}
                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
                title="Agregar a favoritos"
              >
                <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors">
                <FiEye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              manga.attributes.status === 'completed' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {manga.attributes.status === 'completed' ? 'Completado' : 'En curso'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {title}
          </h3>

          {/* Author */}
          <p className="text-slate-400 text-xs mb-3">
            {authorName}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {mainTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <FiStar className="w-3 h-3 text-yellow-400" />
              <span>{manga.attributes.year || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="w-3 h-3" />
              <span>Actualizado</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 