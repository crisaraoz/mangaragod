'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiBook, FiStar, FiHeart, FiPlay, FiArrowLeft, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { useMangaStore } from '@/store/mangaStore';
import type { Manga, Chapter } from '@/types/manga';
import ImageDebug from '@/components/debug/ImageDebug';
import ReactCountryFlag from 'react-country-flag';
import React from 'react';

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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
      const limit = 96;
      while (hasMore) {
        const chaptersData = await mangaDexService.getAllMangaFeedChapters(
          mangaId,
          {
            limit,
            offset,
            order: { volume: 'desc', chapter: 'desc' },
            includes: ['scanlation_group', 'user'],
            includeUnavailable: 0,
          }
        );
        allChapters = [...allChapters, ...chaptersData.data];
        hasMore = chaptersData.data.length === limit;
        offset += limit;
        if (offset > 5000) break;
      }
      setChapters(allChapters);
      console.log('Capítulos obtenidos:', allChapters);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setChaptersLoading(false);
    }
  }, [mangaId]);

  useEffect(() => {
    if (mangaId) {
      loadMangaDetails();
    }
  }, [mangaId, loadMangaDetails]);

  useEffect(() => {
    if (manga) {
      loadChapters();
    }
  }, [manga, loadChapters]);

  // Obtener todos los idiomas disponibles en los capítulos
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    chapters.forEach(ch => {
      if (ch.attributes.translatedLanguage) langs.add(ch.attributes.translatedLanguage);
    });
    return Array.from(langs).sort();
  }, [chapters]);

  // Filtrar capítulos según los idiomas seleccionados
  const filteredChapters = useMemo(() => {
    return chapters.filter(ch => selectedLanguages.includes(ch.attributes.translatedLanguage));
  }, [chapters, selectedLanguages]);

  // Calcular capítulos a mostrar en la página actual
  const paginatedChapters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredChapters.slice(start, start + pageSize);
  }, [filteredChapters, currentPage]);

  const totalPages = Math.ceil(filteredChapters.length / pageSize);

  const handleLanguageChange = (lang: string) => {
    setCurrentPage(1);
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mapeo de idioma a país para bandera
  const langToCountry: Record<string, string> = {
    en: 'US', es: 'AR', ja: 'JP', fr: 'FR', it: 'IT', pt: 'BR', de: 'DE', ru: 'RU', zh: 'CN',
    ca: 'ES', pl: 'PL', th: 'TH', vi: 'VN', hi: 'IN', he: 'IL', 'pt-br': 'BR', ar: 'SA',
    // Puedes agregar más mapeos según los idiomas que aparezcan
  };

  // Etiqueta visual para cada idioma
  const getLangLabel = (lang: string) => (
    <span className="flex items-center gap-1">
      <ReactCountryFlag
        countryCode={langToCountry[lang] || 'UN'}
        svg
        style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle' }}
        title={lang}
      />
      <span className="font-semibold">{lang.toUpperCase()}</span>
    </span>
  );

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
          {/* Dropdown multiselect de idiomas */}
          <div className="relative min-w-[180px]" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1 bg-slate-700 text-white rounded shadow border border-slate-600 min-w-[150px]"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {selectedLanguages.length === 0 ? (
                <span className="text-slate-400">Selecciona idioma(s)</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedLanguages.map(lang => (
                    <span key={lang} className="flex items-center gap-1 bg-purple-600/30 px-2 py-0.5 rounded text-xs">
                      {getLangLabel(lang)}
                    </span>
                  ))}
                </div>
              )}
              <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-slate-800 border border-slate-600 rounded shadow-lg max-h-60 overflow-y-auto">
                {availableLanguages.map(lang => (
                  <div
                    key={lang}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-600/20 ${selectedLanguages.includes(lang) ? 'bg-purple-600/10' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      readOnly
                      className="accent-purple-500"
                    />
                    {getLangLabel(lang)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {chaptersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-slate-700 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : filteredChapters.length > 0 ? (
          <div className="space-y-4">
            {/* Chapter Statistics */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Total: {filteredChapters.length} capítulos</span>
              <span>
                Último: Capítulo {filteredChapters[filteredChapters.length - 1]?.attributes.chapter}
              </span>
            </div>
            {/* Chapter List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paginatedChapters.map((chapter) => {
                const chapterTitle = chapter.attributes.title as unknown as Record<string, string> | null | undefined;
                const titleEs = chapterTitle && typeof chapterTitle === 'object' ? chapterTitle.es : undefined;
                const titleEn = chapterTitle && typeof chapterTitle === 'object' ? chapterTitle.en : undefined;
                const titleFirst = chapterTitle && typeof chapterTitle === 'object' && Object.keys(chapterTitle).length > 0 ? chapterTitle[Object.keys(chapterTitle)[0]] : '';
                return (
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
                        {(titleEs || titleEn || titleFirst) ? ` - ${titleEs || titleEn || titleFirst}` : ''}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(chapter.attributes.publishAt).toLocaleDateString()}
                      </p>
                    </div>
                    <FiPlay className="w-5 h-5 text-purple-400" />
                  </div>
                );
              })}
            </div>
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-slate-300">Página {currentPage} de {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">No hay capítulos disponibles en los idiomas seleccionados.</p>
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