/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiAlertCircle, FiMaximize2 } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { useMangaStore } from '@/store/mangaStore';
import type { AtHomeResponse, Chapter } from '@/types/manga';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useMangaStore();
  
  const [chapterData, setChapterData] = useState<AtHomeResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [chapterInfo, setChapterInfo] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const chapterId = params.chapterId as string;

  const loadChapterPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading chapter:', chapterId); // Debug
      
      const data = await mangaDexService.getChapterPages(chapterId);
      console.log('Chapter data received:', data); // Debug
      
      setChapterData(data);
      
      // Pre-load image loading states
      const initialLoadingStates: Record<number, boolean> = {};
      const initialErrorStates: Record<number, boolean> = {};
      
      data.chapter.data.forEach((_, index) => {
        initialLoadingStates[index] = true;
        initialErrorStates[index] = false;
      });
      
      setImageLoadingStates(initialLoadingStates);
      setImageErrors(initialErrorStates);
      
    } catch (error) {
      console.error('Error loading chapter pages:', error);
      setError('Error al cargar el capítulo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  const nextPage = useCallback(() => {
    if (chapterData && currentPage < chapterData.chapter.data.length - 1) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  }, [chapterData, currentPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  }, [currentPage]);

  useEffect(() => {
    if (chapterId) {
      loadChapterPages();
    }
  }, [chapterId, loadChapterPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previousPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'Escape') {
        router.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, previousPage, router]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleImageLoad = (pageIndex: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [pageIndex]: false
    }));
  };

  const handleImageError = (pageIndex: number) => {
    console.error(`Error loading image for page ${pageIndex}`);
    setImageLoadingStates(prev => ({
      ...prev,
      [pageIndex]: false
    }));
    setImageErrors(prev => ({
      ...prev,
      [pageIndex]: true
    }));
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollToTop();
  };

  // Cargar metadatos del capítulo y todos los capítulos del manga
  useEffect(() => {
    async function fetchChapterInfoAndList() {
      try {
        const info: Chapter = await mangaDexService.getChapterById(chapterId);
        setChapterInfo(info);
        // Obtener todos los capítulos del manga
        if (info && info.relationships) {
          const mangaRel = info.relationships.find((rel) => (rel as { id: string; type: string }).type === 'manga') as { id: string; type: string } | undefined;
          if (mangaRel) {
            const chaptersResp = await mangaDexService.getAllMangaFeedChapters(mangaRel.id, { language: [info.attributes.translatedLanguage] });
            setAllChapters(chaptersResp.data);
          }
        }
      } catch {
        // Ignorar error
      }
    }
    fetchChapterInfoAndList();
  }, [chapterId]);

  // Pantalla completa
  const handleFullscreen = () => {
    if (!isFullscreen && readerRef.current) {
      if (readerRef.current.requestFullscreen) {
        readerRef.current.requestFullscreen();
      } else if ((readerRef.current as any).webkitRequestFullscreen) {
        (readerRef.current as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadChapterPages}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.back()}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Capítulo no encontrado</h2>
          <button
            onClick={() => router.back()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totalPages = chapterData.chapter.data.length;
  const currentPageUrl = mangaDexService.getPageUrl(
    chapterData.baseUrl,
    chapterData.chapter.hash,
    chapterData.chapter.data[currentPage],
    settings.dataSaver || false
  );

  console.log('Current page URL:', currentPageUrl); // Debug

  return (
    <div ref={readerRef} className={isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}>
      {/* Barra superior con info de capítulo y controles */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-black/80 sticky top-0 z-20 gap-2"
        style={{ minHeight: '48px' }}
      >
        <button onClick={() => router.back()} className="text-white flex items-center space-x-2 min-w-[70px]">
          <FiArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver</span>
        </button>
        <div className="flex-1 text-center truncate px-2">
          {chapterInfo && (
            <span className="text-white font-bold truncate block max-w-full">
              Capítulo {chapterInfo.attributes.chapter || ''} {chapterInfo.attributes.title ? `- ${chapterInfo.attributes.title}` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 min-w-[120px] justify-end">
          {/* Selector de capítulos */}
          {allChapters.length > 0 && (
            <select
              className="bg-slate-800 text-white rounded px-2 py-1 max-w-[160px] w-full sm:w-auto text-xs sm:text-base"
              value={chapterId}
              onChange={e => router.push(`/read/${e.target.value}`)}
              style={{ minWidth: '90px' }}
            >
              {allChapters.map(chap => (
                <option key={chap.id} value={chap.id}>
                  Cap. {chap.attributes.chapter || '?'} {chap.attributes.title ? `- ${chap.attributes.title}` : ''}
                </option>
              ))}
            </select>
          )}
          {/* Botón pantalla completa: visible solo en desktop, flotante en móvil */}
          <button
            onClick={handleFullscreen}
            className="text-white ml-2 hidden sm:inline-flex"
            title="Pantalla completa"
          >
            <FiMaximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Botón pantalla completa flotante en móvil */}
      <button
        onClick={handleFullscreen}
        className="sm:hidden fixed bottom-20 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all"
        title="Pantalla completa"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,120,0.25)' }}
      >
        <FiMaximize2 className="w-7 h-7" />
      </button>
      {/* Contenedor de imagen con padding lateral en móvil */}
      <div
        ref={containerRef}
        className="pt-4 pb-20 overflow-auto h-screen flex flex-col items-center"
        style={{ paddingLeft: 'max(8px, env(safe-area-inset-left))', paddingRight: 'max(8px, env(safe-area-inset-right))' }}
      >
        <div className="flex justify-center w-full">
          {chapterData && (
            <Image
              src={currentPageUrl}
              alt={`Página ${currentPage + 1}`}
              width={800}
              height={1200}
              className={`w-full h-auto rounded-lg shadow-2xl max-w-[100vw] sm:max-w-[600px] md:max-w-[800px] ${imageLoadingStates[currentPage] ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => handleImageLoad(currentPage)}
              onError={() => handleImageError(currentPage)}
              priority
            />
          )}
        </div>
        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          {currentPage > 0 && (
            <button
              onClick={previousPage}
              className="ml-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          {currentPage < totalPages - 1 && (
            <button
              onClick={nextPage}
              className="mr-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Controles de navegación de página */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 flex items-center justify-center gap-2 px-2 py-2 sm:py-4">
        <button
          onClick={previousPage}
          disabled={currentPage === 0}
          className="flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-base min-w-[70px] sm:min-w-[110px]"
        >
          <span className="truncate">Anterior</span>
        </button>
        <select
          value={currentPage}
          onChange={e => goToPage(Number(e.target.value))}
          className="mx-2 bg-slate-800 text-white rounded px-2 py-1 text-xs sm:text-base"
          style={{ minWidth: '80px' }}
        >
          {Array.from({ length: totalPages }).map((_, idx) => (
            <option key={idx} value={idx}>
              Página {idx + 1}
            </option>
          ))}
        </select>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-base min-w-[70px] sm:min-w-[110px]"
        >
          <span className="truncate">Siguiente</span>
        </button>
      </div>
      
      {/* Debug Component - Solo en desarrollo */}
      {/* {process.env.NODE_ENV === 'development' && chapterData && (
        <ImageDebug
          mangaId="debug"
          fileName={chapterData.chapter.data[currentPage]}
        />
      )} */}
    </div>
  );
} 