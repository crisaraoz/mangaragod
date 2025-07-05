'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBook, FiStar, FiHeart, FiPlus } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

interface MangaCardProps {
  manga: Manga;
}

export function MangaCard({ manga }: MangaCardProps) {
  const { addToFavorites, favorites } = useMangaStore();
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Obtener información del manga
  const title = manga.attributes.title.en || 
               manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
               'Sin título';
  
  const description = manga.attributes.description.en || 
                     manga.attributes.description[Object.keys(manga.attributes.description)[0]] || 
                     '';

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

  // Obtener tags (géneros)
  const tags = manga.attributes.tags.slice(0, 3).map(tag => 
    tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]
  );

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToFavorites(manga, 'plan-to-read');
  };

  return (
    <Link href={`/manga/${manga.id}`} className="group">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-slate-700">
          {coverUrl && !imageError ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBook className="w-16 h-16 text-slate-500" />
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={handleAddToFavorites}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
                title="Agregar a favoritos"
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-purple-400 transition-colors">
            {title}
          </h3>

          {/* Author */}
          <p className="text-slate-400 text-sm">
            Por {authorName}
          </p>

          {/* Description */}
          {description && (
            <p className="text-slate-300 text-sm line-clamp-3">
              {description.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {manga.attributes.status === 'completed' ? 'Completado' : 
               manga.attributes.status === 'ongoing' ? 'En curso' : 
               'Estado desconocido'}
            </span>
            <div className="flex items-center space-x-1 text-yellow-400">
              <FiStar className="w-4 h-4" />
              <span>{manga.attributes.year || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 