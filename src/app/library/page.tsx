'use client';

import { useState } from 'react';
import { FiBook, FiGrid, FiList } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import { FavoriteManga } from '@/types/manga';
import Image from 'next/image';

export default function LibraryPage() {
  const { getFavoriteByStatus, favorites } = useMangaStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<FavoriteManga['status'] | 'all'>('all');

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'completed', label: 'Completados' },
    { value: 'plan-to-read', label: 'Planificado' },
    { value: 'dropped', label: 'Abandonados' },
  ];

  const getFilteredManga = () => {
    if (selectedStatus === 'all') {
      return favorites;
    }
    return getFavoriteByStatus(selectedStatus);
  };

  const filteredManga = getFilteredManga();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <FiBook className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mi Biblioteca</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm flex-1 sm:flex-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusOptions.slice(1).map((option) => {
          const count = option.value === 'all' ? favorites.length : getFavoriteByStatus(option.value as FavoriteManga['status']).length;
          return (
            <div key={option.value} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-lg sm:text-2xl font-bold text-white">{count}</div>
              <div className="text-xs sm:text-sm text-slate-400">{option.label}</div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {filteredManga.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FiBook className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
            {selectedStatus === 'all' ? 'Tu biblioteca está vacía' : `No tienes mangas ${statusOptions.find(s => s.value === selectedStatus)?.label.toLowerCase()}`}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Comienza explorando y agregando mangas a tu biblioteca
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">
              {filteredManga.length} manga{filteredManga.length !== 1 ? 's' : ''}
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {filteredManga.map((favorite) => (
                <div key={favorite.id} className="group relative">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                    <div className="relative aspect-[2/3] bg-slate-700">
                      <Image
                        src={favorite.coverUrl}
                        alt={favorite.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 12.5vw"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-white font-medium text-xs sm:text-sm line-clamp-2 mb-1">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                          favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                          favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                          favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {favorite.status === 'reading' ? 'Leyendo' :
                           favorite.status === 'completed' ? 'Completado' :
                           favorite.status === 'plan-to-read' ? 'Planificado' :
                           'Abandonado'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredManga.map((favorite) => (
                <div key={favorite.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={favorite.coverUrl}
                        alt={favorite.title}
                        width={48}
                        height={64}
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-1">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full ${
                          favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                          favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                          favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {statusOptions.find(s => s.value === favorite.status)?.label}
                        </span>
                        <span className="hidden sm:inline">
                          Agregado: {new Date(favorite.addedAt).toLocaleDateString()}
                        </span>
                        {favorite.lastReadAt && (
                          <span className="hidden md:inline">
                            Última lectura: {new Date(favorite.lastReadAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 