'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiBook, FiZap, FiTrendingUp, FiHeart, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import type { AIRecommendation } from '@/app/api/recommendations/route';
import { mangaDexService } from '@/services/mangadex';

interface AIRecommendationsProps {
  className?: string;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ className = '' }) => {
  const router = useRouter();
  const { favorites } = useMangaStore();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favorites, limit: 8 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setHasLoaded(true);
      } else {
        console.error('Error loading recommendations:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true);
      await loadRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMangaClick = (mangaId: string) => {
    router.push(`/manga/${mangaId}`);
  };

  const getCategoryIcon = (category: AIRecommendation['category']) => {
    switch (category) {
      case 'similar_genre':
        return <FiHeart className="w-4 h-4 text-purple-400" />;
      case 'same_author':
        return <FiBook className="w-4 h-4 text-blue-400" />;
      case 'trending':
        return <FiTrendingUp className="w-4 h-4 text-green-400" />;
      case 'hidden_gem':
        return <FiZap className="w-4 h-4 text-yellow-400" />;
      default:
        return <FiEye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: AIRecommendation['category']) => {
    switch (category) {
      case 'similar_genre':
        return 'Género Similar';
      case 'same_author':
        return 'Mismo Autor';
      case 'trending':
        return 'Tendencia';
      case 'hidden_gem':
        return 'Joya Oculta';
      default:
        return 'Recomendado';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Mobile Optimized Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="p-1 sm:p-1.5 bg-purple-600/20 rounded-lg flex-shrink-0">
            <FiZap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-bold text-white truncate">
              Recomendaciones de IA
            </h2>
            <p className="text-slate-400 text-xs hidden sm:block">
              {!hasLoaded 
                ? favorites.length > 0 
                  ? `Listo para analizar tus mangas favoritos`
                  : 'Descubre mangas populares con IA'
                : favorites.length > 0 
                  ? `Basado en tus ${favorites.length} favoritos`
                  : 'Recomendaciones populares'
              }
            </p>
          </div>
        </div>
        
        {/* Mobile Optimized Button */}
        <button
          onClick={hasLoaded ? refreshRecommendations : loadRecommendations}
          disabled={loading || refreshing}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <FiRefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
          <span className="text-xs sm:text-sm whitespace-nowrap">
            {hasLoaded ? 'Actualizar' : 'Ver IA'}
          </span>
        </button>
      </div>

      {/* Solo mostrar la caja de contenido cuando se ha cargado o está cargando */}
      {(hasLoaded || loading) && (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
          {loading ? (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-700/30 rounded-lg animate-pulse">
                    <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-600 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-600 rounded w-1/2"></div>
                      <div className="h-2 bg-slate-600 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {recommendations.map((rec) => (
                  <AIRecommendationCard
                    key={rec.manga.id}
                    recommendation={rec}
                    onClick={() => handleMangaClick(rec.manga.id)}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryLabel={getCategoryLabel}
                    getConfidenceColor={getConfidenceColor}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 px-3 sm:px-4">
              <FiZap className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-sm sm:text-base font-medium text-slate-300 mb-2">
                No hay recomendaciones disponibles
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                {favorites.length === 0 
                  ? 'Agrega algunos mangas a tus favoritos para recibir recomendaciones personalizadas'
                  : 'Intenta actualizar las recomendaciones'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onClick: () => void;
  getCategoryIcon: (category: AIRecommendation['category']) => React.ReactNode;
  getCategoryLabel: (category: AIRecommendation['category']) => string;
  getConfidenceColor: (confidence: number) => string;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  onClick,
  getCategoryIcon,
  getCategoryLabel,
  getConfidenceColor
}) => {
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCoverUrl = async () => {
      const coverArt = recommendation.manga.relationships.find(rel => rel.type === 'cover_art');
      if (coverArt?.attributes?.fileName) {
        const url = mangaDexService.getCoverUrl(
          recommendation.manga.id, 
          coverArt.attributes.fileName, 
          'small'
        );
        setCoverUrl(url);
      }
    };

    loadCoverUrl();
  }, [recommendation.manga]);

  const title = recommendation.manga.attributes.title.en || 
               recommendation.manga.attributes.title[Object.keys(recommendation.manga.attributes.title)[0]] || 
               'Sin título';

  const genres = recommendation.manga.attributes.tags
    ?.filter(tag => tag.attributes.group === 'genre')
    .slice(0, 2)
    .map(tag => tag.attributes.name.en) || [];

  return (
    <div 
      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Mobile Optimized Cover Image */}
      <div className="relative w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0 bg-slate-600 rounded overflow-hidden">
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
            <FiBook className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400" />
          </div>
        )}
      </div>

      {/* Mobile Optimized Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <h3 className="text-white font-medium text-xs sm:text-sm truncate group-hover:text-purple-300 transition-colors pr-1">
            {title}
          </h3>
          <div className="flex items-center space-x-1 ml-1 flex-shrink-0">
            {getCategoryIcon(recommendation.category)}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">
            {recommendation.reason}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-hidden">
              {genres.slice(0, 1).map((genre, index) => (
                <span
                  key={index}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/10 text-purple-300 text-xs rounded truncate"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {getCategoryLabel(recommendation.category)}
              </span>
              <div className={`text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                {Math.round(recommendation.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;