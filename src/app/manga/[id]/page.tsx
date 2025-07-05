'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiBook, FiStar, FiHeart, FiPlay, FiArrowLeft, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { useMangaStore } from '@/store/mangaStore';
import type { Manga, Chapter } from '@/types/manga';
import ImageDebug from '@/components/debug/ImageDebug';
import ReactCountryFlag from 'react-country-flag';

function getFlagByLanguage(lang: string) {
  switch (lang) {
    case 'es': return '🇦🇷'; // Español (Argentina)
    case 'en': return '🇺🇸'; // Inglés (Estados Unidos)
    case 'ja': return '🇯🇵'; // Japonés
    case 'fr': return '🇫🇷'; // Francés
    case 'it': return '🇮🇹'; // Italiano
    case 'pt': return '🇧🇷'; // Portugués (Brasil)
    case 'de': return '🇩🇪'; // Alemán
    case 'ru': return '🇷🇺'; // Ruso
    case 'zh': return '🇨🇳'; // Chino
    default: return '🏳️'; // Otro/no definido
  }
}

function getCountryCode(lang: string) {
  switch (lang) {
    case 'es': return 'AR'; // Español (Argentina)
    case 'en': return 'US'; // Inglés (Estados Unidos)
    case 'ja': return 'JP'; // Japonés
    case 'fr': return 'FR'; // Francés
    case 'it': return 'IT'; // Italiano
    case 'pt': return 'BR'; // Portugués (Brasil)
    case 'de': return 'DE'; // Alemán
    case 'ru': return 'RU'; // Ruso
    case 'zh': return 'CN'; // Chino
    default: return 'UN'; // Unknown
  }
}

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToFavorites, favorites } = useMangaStore();
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const mangaId = params.id as string;

  const loadMangaDetails = useCallback(async () => {
    try {
      setLoading(true);
      const mangaData = await mangaDexService.getManga(mangaId);
      setManga(mangaData);
    } catch (error) {
      console.error('Error loading manga details:', error);
    } finally {
      setLoading(false);
    }
  }, [mangaId]);

  const loadChapters = useCallback(async () => {
    try {
      setChaptersLoading(true);
      let allChapters: Chapter[] = [];
      let offset = 0;
      let hasMore = true;
      const languageFilter = selectedLanguage === 'all' ? undefined : [selectedLanguage];
      while (hasMore) {
        const chaptersData = await mangaDexService.getAllMangaFeedChapters(
          mangaId,
          languageFilter ? { language: languageFilter } : {}
        );
        allChapters = [...allChapters, ...chaptersData.data];
        hasMore = chaptersData.data.length === 100;
        offset += 100;
        if (offset > 5000) break;
      }
      const sortedChapters = allChapters
        .filter(chapter => chapter.attributes.chapter)
        .sort((a, b) => {
          const chapterA = parseFloat(a.attributes.chapter || '0');
          const chapterB = parseFloat(b.attributes.chapter || '0');
          return chapterA - chapterB;
        });
      setChapters(sortedChapters);
      console.log('Capítulos obtenidos:', sortedChapters);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setChaptersLoading(false);
    }
  }, [mangaId, selectedLanguage]);

  useEffect(() => {
    if (mangaId) {
      loadMangaDetails();
    }
  }, [mangaId, loadMangaDetails]);

  useEffect(() => {
    if (manga) {
      loadChapters();
    }
  }, [manga, selectedLanguage, loadChapters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-white mb-4">Manga no encontrado</h2>
        <button
          onClick={() => router.back()}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  const title = manga.attributes.title.en || 
               manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
               'Sin título';

  const description = manga.attributes.description.en || 
                     manga.attributes.description[Object.keys(manga.attributes.description)[0]] || 
                     '';

  const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
  const coverUrl = coverArt?.attributes?.fileName 
    ? mangaDexService.getCoverUrl(manga.id, coverArt.attributes.fileName, 'large')
    : null;

  const author = manga.relationships.find(rel => rel.type === 'author');
  const authorName = author?.attributes?.name || 'Autor desconocido';

  const isFavorite = favorites.some(fav => fav.id === manga.id);

  const handleAddToFavorites = () => {
    addToFavorites(manga, 'plan-to-read');
  };

  const handleReadChapter = (chapterId: string) => {
    router.push(`/read/${chapterId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
      </div>

      {/* Manga Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[3/4] bg-slate-700 rounded-lg overflow-hidden">
              {coverUrl && !imageError ? (
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiBook className="w-24 h-24 text-slate-500" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Actions */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddToFavorites}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFavorite
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'En favoritos' : 'Agregar a favoritos'}</span>
                </button>
                
                {chapters.length > 0 && (
                  <button
                    onClick={() => handleReadChapter(chapters[0].id)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiPlay className="w-5 h-5" />
                    <span>Leer ahora</span>
                  </button>
                )}
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <FiUser className="w-5 h-5" />
                <span>Autor: {authorName}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-300">
                <FiCalendar className="w-5 h-5" />
                <span>Año: {manga.attributes.year || 'N/A'}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-300">
                <FiBook className="w-5 h-5" />
                <span>Estado: {manga.attributes.status === 'completed' ? 'Completado' : 'En curso'}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-300">
                <FiStar className="w-5 h-5" />
                <span>Demográfico: {manga.attributes.publicationDemographic || 'N/A'}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <FiTag className="w-5 h-5" />
                <span>Géneros:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {manga.attributes.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
                  >
                    {tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Descripción</h3>
                <p className="text-slate-300 leading-relaxed">
                  {description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Capítulos</h2>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="bg-slate-800 text-white rounded px-2 py-1"
          >
            <option value="all">Todos</option>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        {chaptersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-slate-700 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : chapters.length > 0 ? (
          <div className="space-y-4">
            {/* Chapter Statistics */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Total: {chapters.length} capítulos</span>
              <span>
                Último: Capítulo {chapters[chapters.length - 1]?.attributes.chapter}
              </span>
            </div>
            
            {/* Chapter List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  onClick={() => handleReadChapter(chapter.id)}
                  className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">
                      <ReactCountryFlag
                        countryCode={getCountryCode(chapter.attributes.translatedLanguage)}
                        svg
                        style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em', verticalAlign: 'middle' }}
                        title={chapter.attributes.translatedLanguage}
                      />
                      Capítulo {chapter.attributes.chapter}
                      {chapter.attributes.title && typeof chapter.attributes.title === 'object' ? (chapter.attributes.title.es || chapter.attributes.title.en || chapter.attributes.title[Object.keys(chapter.attributes.title)[0]] ? ` - ${chapter.attributes.title.es || chapter.attributes.title.en || chapter.attributes.title[Object.keys(chapter.attributes.title)[0]]}` : '') : ''}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(chapter.attributes.publishAt).toLocaleDateString()}
                    </p>
                  </div>
                  <FiPlay className="w-5 h-5 text-purple-400" />
                </div>
              ))}
            </div>
            
            {chapters.length > 20 && (
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Lista limitada por rendimiento. Usa el selector de idioma para filtrar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">No hay capítulos disponibles en {selectedLanguage === 'en' ? 'inglés' : selectedLanguage === 'es' ? 'español' : 'japonés'}</p>
          </div>
        )}
      </div>
      
      {/* Debug Info para portadas */}
      {coverArt?.attributes?.fileName && (
        <ImageDebug 
          mangaId={manga.id} 
          fileName={coverArt.attributes.fileName} 
        />
      )}
    </div>
  );
} 