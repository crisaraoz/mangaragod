'use client';

import { useState } from 'react';
import { FiBookmark, FiGrid, FiList, FiPlay, FiClock, FiBook } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import Link from 'next/link';
import Image from 'next/image';
import type { FavoriteManga, ReadingProgress } from '@/types/manga';

export default function ReadingPage() {
  const { favorites, readingProgress } = useMangaStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Obtener mangas que están siendo leídos
  const readingManga = favorites.filter(fav => fav.status === 'reading');
  
  // Obtener mangas con progreso de lectura
  const recentlyRead = readingProgress
    .map((progress) => {
      const manga = favorites.find(fav => fav.id === progress.mangaId);
      return manga ? { manga, progress } : null;
    })
    .filter((item): item is { manga: FavoriteManga; progress: ReadingProgress } => item !== null)
    .sort((a, b) => new Date(b.progress.updatedAt).getTime() - new Date(a.progress.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Continuar Leyendo
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Retoma donde lo dejaste
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

      {/* Compact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center space-x-2">
            <FiBookmark className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">{readingManga.length}</div>
              <div className="text-xs text-slate-400">Leyendo</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">{recentlyRead.length}</div>
              <div className="text-xs text-slate-400">Con progreso</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center space-x-2">
            <FiBook className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {readingProgress.length}
              </div>
              <div className="text-xs text-slate-400">Total progreso</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center space-x-2">
            <FiPlay className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {recentlyRead.length > 0 ? 'Activo' : 'N/A'}
              </div>
              <div className="text-xs text-slate-400">Estado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Read */}
      {recentlyRead.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Leídos Recientemente</h2>
            <span className="text-xs sm:text-sm text-slate-400">Continúa donde lo dejaste</span>
          </div>
          
          <div className="space-y-2">
            {recentlyRead.map(({ manga, progress }) => (
              <div key={manga.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-12 sm:w-12 sm:h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={manga.coverUrl}
                        alt={manga.title}
                        width={48}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 text-sm sm:text-base line-clamp-1">
                        {manga.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mb-1">
                        Capítulo: {progress.lastChapterNumber || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-slate-500">
                        <span>Progreso: {Math.round(progress.progress)}%</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{new Date(progress.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/manga/${manga.id}`}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm"
                    >
                      <FiPlay className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Continuar</span>
                      <span className="sm:hidden">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently Reading */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <FiBookmark className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-semibold text-white">Actualmente Leyendo</h2>
          <span className="text-xs sm:text-sm text-slate-400">
            {readingManga.length} títulos
          </span>
        </div>
        
        {readingManga.length > 0 ? (
          <div className={`grid gap-3 ${viewMode === 'grid' 
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8' 
            : 'grid-cols-1'
          }`}>
            {readingManga.map((favorite) => (
              <div key={favorite.id} className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <Link href={`/manga/${favorite.id}`}>
                  {viewMode === 'grid' ? (
                    <>
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
                        <div className="flex justify-center">
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                            Leyendo
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-12 sm:w-12 sm:h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={favorite.coverUrl}
                            alt={favorite.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1 mb-1">
                            {favorite.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                              Leyendo
                            </span>
                            <span className="text-xs text-slate-400">
                              Agregado: {new Date(favorite.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiBookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              No tienes mangas en progreso. ¡Comienza a leer!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 