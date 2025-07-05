'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiBook, FiCalendar, FiSearch } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

interface FeaturedCarouselProps {
  mangas: Manga[];
  onMangaClick: (mangaId: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ 
  mangas, 
  onMangaClick,
  onSearch,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCoverUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const manga of mangas) {
        const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
        if (coverArt?.attributes?.fileName) {
          urls[manga.id] = mangaDexService.getCoverUrl(
            manga.id, 
            coverArt.attributes.fileName, 
            'large'
          );
        }
      }
      
      setCoverUrls(urls);
    };

    if (mangas.length > 0) {
      loadCoverUrls();
    }
  }, [mangas]);

  useEffect(() => {
    if (mangas.length > 1 && !isDragging) {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mangas.length);
      }, 6000);

      return () => {
        if (autoSlideRef.current) {
          clearInterval(autoSlideRef.current);
        }
      };
    }
  }, [mangas.length, isDragging]);

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const goToPrevious = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => (prev - 1 + mangas.length) % mangas.length);
  };

  const goToNext = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => (prev + 1) % mangas.length);
  };

  const goToSlide = (index: number) => {
    stopAutoSlide();
    setCurrentIndex(index);
  };

  // Drag functionality - Solo para detectar swipe, no para mover visualmente
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    stopAutoSlide();
  };

  const handleMouseMove = () => {
    if (!isDragging) return;
    // No aplicamos ningún transform visual aquí
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const dragDistance = e.clientX - dragStart;
    
    // Si el drag es significativo (más de 100px), cambiar slide
    if (Math.abs(dragDistance) > 100) {
      if (dragDistance > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    stopAutoSlide();
  };

  const handleTouchMove = () => {
    if (!isDragging) return;
    // No aplicamos ningún transform visual aquí
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const dragDistance = e.changedTouches[0].clientX - dragStart;
    
    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  if (mangas.length === 0) {
    return null;
  }

  const currentManga = mangas[currentIndex];
  const title = currentManga.attributes.title.en || 
               currentManga.attributes.title[Object.keys(currentManga.attributes.title)[0]] || 
               'Sin título';

  const description = currentManga.attributes.description?.en || 
                     currentManga.attributes.description?.[Object.keys(currentManga.attributes.description)[0]] || 
                     'Sin descripción disponible';

  const truncatedDescription = description.length > 120 
    ? description.substring(0, 120) + '...' 
    : description;

  const genres = currentManga.attributes.tags
    ?.filter(tag => tag.attributes.group === 'genre')
    .slice(0, 2)
    .map(tag => tag.attributes.name.en) || [];

  const publicationYear = currentManga.attributes.year || 'N/A';
  const status = currentManga.attributes.status || 'unknown';

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

  return (
    <div className={`relative bg-slate-900 ${className}`}>
      {/* Compact Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Descubre Mangas
            </h1>
            <p className="text-slate-400 text-sm">
              Explora miles de títulos en múltiples idiomas
            </p>
          </div>
          
          {/* Compact Search */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 px-4 py-2 pl-10 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <FiSearch className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Compact Carousel */}
      <div className="container mx-auto px-4">
        <div 
          ref={carouselRef}
          className="relative bg-slate-800 rounded-lg overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {coverUrls[currentManga.id] && !imageErrors[currentManga.id] ? (
              <Image
                src={coverUrls[currentManga.id]}
                alt={title}
                fill
                className="object-cover opacity-10 blur-sm transition-opacity duration-500"
                onError={() => setImageErrors(prev => ({ ...prev, [currentManga.id]: true }))}
                unoptimized
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
            )}
            <div className="absolute inset-0 bg-slate-800/80"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-6 max-w-5xl mx-auto">
              {/* Cover Image */}
              <div className="relative w-24 h-32 md:w-32 md:h-44 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden shadow-lg">
                {coverUrls[currentManga.id] && !imageErrors[currentManga.id] ? (
                  <Image
                    src={coverUrls[currentManga.id]}
                    alt={title}
                    fill
                    className="object-cover transition-opacity duration-500"
                    onError={() => setImageErrors(prev => ({ ...prev, [currentManga.id]: true }))}
                    unoptimized
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiBook className="w-6 h-6 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                    {title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      <span>{publicationYear}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex gap-1">
                    {genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {truncatedDescription}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => onMangaClick(currentManga.id)}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiBook className="w-4 h-4" />
                  <span>Ver Detalles</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {mangas.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Indicators */}
          {mangas.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
              {mangas.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Drag Hint */}
          <div className="absolute bottom-12 right-4 text-slate-400 text-xs opacity-60 z-30 hidden md:block">
            Arrastra o usa las flechas para navegar
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel; 