'use client';

import { useState } from 'react';
import { FiHeart, FiTrash2, FiEdit3 } from 'react-icons/fi';
import Image from 'next/image';
import { useMangaStore } from '@/store/mangaStore';
import { FavoriteManga } from '@/types/manga';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, updateFavoriteStatus } = useMangaStore();
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'status'>('added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const statusOptions = [
    { value: 'reading', label: 'Leyendo', color: 'bg-green-500' },
    { value: 'completed', label: 'Completado', color: 'bg-blue-500' },
    { value: 'plan-to-read', label: 'Planificado', color: 'bg-yellow-500' },
    { value: 'dropped', label: 'Abandonado', color: 'bg-red-500' },
  ];

  const sortedFavorites = [...favorites].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'added':
      default:
        comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleStatusChange = (mangaId: string, newStatus: FavoriteManga['status']) => {
    updateFavoriteStatus(mangaId, newStatus);
  };

  const handleRemove = (mangaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este manga de favoritos?')) {
      removeFromFavorites(mangaId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <FiHeart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Favoritos</h1>
          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-sm">
            {favorites.length}
          </span>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm flex-1 sm:flex-none"
          >
            <option value="added">Fecha agregado</option>
            <option value="title">Título</option>
            <option value="status">Estado</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors text-sm"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FiHeart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
            No tienes mangas favoritos
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Comienza explorando y agregando mangas a tus favoritos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {sortedFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="relative aspect-[2/3] bg-slate-700">
                  <Image
                    src={favorite.coverUrl}
                    alt={favorite.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
                    title="Eliminar de favoritos"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="p-2 sm:p-3 space-y-2">
                <h3 className="text-white font-medium text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
                  {favorite.title}
                </h3>
                
                <div className="space-y-1.5">
                  <select
                    value={favorite.status}
                    onChange={(e) => handleStatusChange(favorite.id, e.target.value as FavoriteManga['status'])}
                    className="w-full bg-slate-700 text-white px-2 py-1 rounded text-xs border border-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="hidden sm:inline">
                      {new Date(favorite.addedAt).toLocaleDateString()}
                    </span>
                    <span className="sm:hidden">
                      {new Date(favorite.addedAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </span>
                    <button
                      onClick={() => window.open(`/manga/${favorite.id}`, '_blank')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                      title="Ver detalles"
                    >
                      <FiEdit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                    favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                    favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {statusOptions.find(s => s.value === favorite.status)?.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 