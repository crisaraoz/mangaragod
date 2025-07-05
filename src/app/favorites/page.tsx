'use client';

import { useState } from 'react';
import { FiHeart, FiTrash2, FiEdit3 } from 'react-icons/fi';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiHeart className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Favoritos</h1>
          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
            {favorites.length}
          </span>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="added">Fecha agregado</option>
            <option value="title">Título</option>
            <option value="status">Estado</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <FiHeart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No tienes mangas favoritos
          </h2>
          <p className="text-slate-400">
            Comienza explorando y agregando mangas a tus favoritos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="relative">
                <img
                  src={favorite.coverUrl}
                  alt={favorite.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="Eliminar de favoritos"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <h3 className="text-white font-semibold text-lg line-clamp-2">
                  {favorite.title}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Estado:</span>
                    <select
                      value={favorite.status}
                      onChange={(e) => handleStatusChange(favorite.id, e.target.value as FavoriteManga['status'])}
                      className="bg-slate-700 text-white px-3 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Agregado:</span>
                    <span>{new Date(favorite.addedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {favorite.lastReadAt && (
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Última lectura:</span>
                      <span>{new Date(favorite.lastReadAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    favorite.status === 'reading' ? 'bg-green-500/20 text-green-300' :
                    favorite.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                    favorite.status === 'plan-to-read' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {statusOptions.find(s => s.value === favorite.status)?.label}
                  </span>
                  
                  <button
                    onClick={() => window.open(`/manga/${favorite.id}`, '_blank')}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Ver detalles"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 