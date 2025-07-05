'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiGrid, FiList, FiFilter, FiClock } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { MangaCardCompact } from '@/components/manga/MangaCardCompact';
import type { Manga } from '@/types/manga';

export default function PopularPage() {
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'follows' | 'updated'>('follows');
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');

  useEffect(() => {
    loadPopularManga();
  }, [sortBy, timeRange]);

  const loadPopularManga = async () => {
    try {
      setLoading(true);
      const response = await mangaDexService.getPopularManga(24);
      setPopularManga(response.data);
    } catch (error) {
      console.error('Error loading popular manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = ({ count = 24 }: { count?: number }) => (
    <div className={`grid gap-4 ${viewMode === 'grid' 
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
      : 'grid-cols-1'
    }`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className={`bg-slate-700/50 rounded-lg ${viewMode === 'grid' ? 'h-64' : 'h-20'}`}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Mangas Populares
          </h1>
          <p className="text-slate-400">
            Los títulos más seguidos y mejor valorados
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Ordenar por:</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortBy('follows')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'follows' 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Seguidores
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'rating' 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Valoración
          </button>
          <button
            onClick={() => setSortBy('updated')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'updated' 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Actualizado
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <FiClock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Período:</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === 'all' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === 'month' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === 'week' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === 'day' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Día
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-xl font-bold text-white">{popularManga.length}</div>
              <div className="text-xs text-slate-400">Títulos mostrados</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiGrid className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-xl font-bold text-white">{viewMode === 'grid' ? 'Rejilla' : 'Lista'}</div>
              <div className="text-xs text-slate-400">Vista actual</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiFilter className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-xl font-bold text-white capitalize">{sortBy}</div>
              <div className="text-xs text-slate-400">Ordenado por</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiClock className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xl font-bold text-white capitalize">{timeRange}</div>
              <div className="text-xs text-slate-400">Período</div>
            </div>
          </div>
        </div>
      </div>

      {/* Manga Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Resultados
          </h2>
          {!loading && (
            <span className="text-sm text-slate-400">
              {popularManga.length} títulos
            </span>
          )}
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : popularManga.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
            : 'grid-cols-1'
          }`}>
            {popularManga.map((manga) => (
              <MangaCardCompact key={manga.id} manga={manga} variant={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No se encontraron mangas populares</p>
          </div>
        )}
      </div>
    </div>
  );
} 