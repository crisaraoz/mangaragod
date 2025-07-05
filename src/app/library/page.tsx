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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiBook className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Mi Biblioteca</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.slice(1).map((option) => {
          const count = option.value === 'all' ? favorites.length : getFavoriteByStatus(option.value as FavoriteManga['status']).length;
          return (
            <div key={option.value} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-slate-400">{option.label}</div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {filteredManga.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {selectedStatus === 'all' ? 'Tu biblioteca está vacía' : `No tienes mangas ${statusOptions.find(s => s.value === selectedStatus)?.label.toLowerCase()}`}
          </h2>
          <p className="text-slate-400">
            Comienza explorando y agregando mangas a tu biblioteca
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              {filteredManga.length} manga{filteredManga.length !== 1 ? 's' : ''}
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredManga.map((favorite) => (
                <div key={favorite.id} className="group relative">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                    <div className="relative aspect-[3/4] bg-slate-700">
                      <Image
                        src={favorite.coverUrl}
                        alt={favorite.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                          favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                          favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {statusOptions.find(s => s.value === favorite.status)?.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(favorite.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredManga.map((favorite) => (
                <div key={favorite.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={favorite.coverUrl}
                        alt={favorite.title}
                        width={64}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className={`px-2 py-1 rounded-full ${
                          favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                          favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                          favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {statusOptions.find(s => s.value === favorite.status)?.label}
                        </span>
                        <span>Agregado: {new Date(favorite.addedAt).toLocaleDateString()}</span>
                        {favorite.lastReadAt && (
                          <span>Última lectura: {new Date(favorite.lastReadAt).toLocaleDateString()}</span>
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