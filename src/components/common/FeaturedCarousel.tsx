'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiBook, FiCalendar } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { SearchBar } from '@/components/search/SearchBar';
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
      {/* Mobile Optimized Header */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Descubre Mangas
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Explora miles de títulos en múltiples idiomas
            </p>
          </div>
          
          {/* Mobile Optimized Search Bar */}
          <div className="w-full lg:w-auto lg:min-w-[300px]">
            <SearchBar
              onSearch={onSearch}
              placeholder="Buscar manga..."
              showSuggestions={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile Optimized Carousel */}
      <div className="container mx-auto px-3 sm:px-4">
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

          {/* Mobile Optimized Content */}
          <div className="relative z-10 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
              {/* Mobile Optimized Cover Image */}
              <div className="relative w-20 h-28 sm:w-24 sm:h-32 md:w-32 md:h-44 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden shadow-lg mx-auto sm:mx-0">
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
                    <FiBook className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Mobile Optimized Info */}
              <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                    {title}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      <span>{publicationYear}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>

                {/* Mobile Optimized Genres */}
                {genres.length > 0 && (
                  <div className="flex gap-1 justify-center sm:justify-start flex-wrap">
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

                {/* Mobile Optimized Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-2 md:line-clamp-none">
                  {truncatedDescription}
                </p>

                {/* Mobile Optimized Action Button */}
                <button
                  onClick={() => onMangaClick(currentManga.id)}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto justify-center"
                >
                  <FiBook className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Ver Detalles</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Optimized Navigation Arrows */}
          {mangas.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30"
              >
                <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30"
              >
                <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </>
          )}

          {/* Mobile Optimized Indicators */}
          {mangas.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
              {mangas.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Hide drag hint on mobile */}
          <div className="absolute bottom-8 sm:bottom-12 right-4 text-slate-400 text-xs opacity-60 z-30 hidden lg:block">
            Arrastra o usa las flechas para navegar
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel; 