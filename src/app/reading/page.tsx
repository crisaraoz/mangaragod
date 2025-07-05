'use client';

import { useState } from 'react';
import { FiBookmark, FiGrid, FiList, FiPlay, FiClock, FiBook } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import { MangaCardCompact } from '@/components/manga/MangaCardCompact';
import Link from 'next/link';

export default function ReadingPage() {
  const { favorites, readingProgress } = useMangaStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Obtener mangas que están siendo leídos
  const readingManga = favorites.filter(fav => fav.status === 'reading');
  
  // Obtener mangas con progreso de lectura
  const recentlyRead = Object.entries(readingProgress)
    .map(([mangaId, progress]) => {
      const manga = favorites.find(fav => fav.id === mangaId);
      return manga ? { manga, progress } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.progress.lastRead).getTime() - new Date(a!.progress.lastRead).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Continuar Leyendo
          </h1>
          <p className="text-slate-400">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiBookmark className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-xl font-bold text-white">{readingManga.length}</div>
              <div className="text-xs text-slate-400">Leyendo</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiClock className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-xl font-bold text-white">{recentlyRead.length}</div>
              <div className="text-xs text-slate-400">Con progreso</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiBook className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-xl font-bold text-white">
                {Object.values(readingProgress).reduce((acc, progress) => acc + progress.chapters.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Capítulos leídos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center space-x-3">
            <FiPlay className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xl font-bold text-white">
                {recentlyRead.length > 0 ? 'Reciente' : 'N/A'}
              </div>
              <div className="text-xs text-slate-400">Última lectura</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Read */}
      {recentlyRead.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FiClock className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Leídos Recientemente</h2>
            <span className="text-sm text-slate-400">Continúa donde lo dejaste</span>
          </div>
          
          <div className="space-y-3">
            {recentlyRead.map(({ manga, progress }) => (
              <div key={manga.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <FiBook className="w-6 h-6 text-slate-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {manga.attributes.title.en || 
                         manga.attributes.title[Object.keys(manga.attributes.title)[0]]}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        Último capítulo leído: {progress.chapters[progress.chapters.length - 1] || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{progress.chapters.length} capítulos leídos</span>
                        <span>•</span>
                        <span>{new Date(progress.lastRead).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/manga/${manga.id}`}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FiPlay className="w-4 h-4" />
                      <span>Continuar</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently Reading */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <FiBookmark className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Actualmente Leyendo</h2>
          <span className="text-sm text-slate-400">
            {readingManga.length} títulos
          </span>
        </div>
        
        {readingManga.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
            : 'grid-cols-1'
          }`}>
            {readingManga.map((favorite) => (
              <MangaCardCompact key={favorite.id} manga={favorite} variant={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiBookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No hay mangas en tu lista de lectura</p>
            <Link 
              href="/search"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <FiBook className="w-4 h-4" />
              <span>Explorar Mangas</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 