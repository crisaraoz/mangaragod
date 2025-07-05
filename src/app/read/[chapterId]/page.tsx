'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight, FiSettings, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import { useMangaStore } from '@/store/mangaStore';
import type { AtHomeResponse } from '@/types/manga';

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
  const [showSettings, setShowSettings] = useState(false);
  const [fitToWidth, setFitToWidth] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

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

  const retryCurrentPage = () => {
    setImageLoadingStates(prev => ({
      ...prev,
      [currentPage]: true
    }));
    setImageErrors(prev => ({
      ...prev,
      [currentPage]: false
    }));
  };

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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            <div className="text-white">
              <span className="text-lg font-semibold">
                Página {currentPage + 1} de {totalPages}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={fitToWidth}
                  onChange={(e) => setFitToWidth(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-purple-500"
                />
                <span>Ajustar al ancho</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="pt-16 pb-20 overflow-auto h-screen"
        style={{ paddingTop: showSettings ? '8rem' : '4rem' }}
      >
        <div className="flex justify-center">
          <div className="relative max-w-4xl">
            {/* Current Page Image */}
            <div className="relative">
              {/* Loading State */}
              {imageLoadingStates[currentPage] && (
                <div className="flex items-center justify-center bg-slate-800 rounded-lg min-h-[600px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white">Cargando página {currentPage + 1}...</p>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {imageErrors[currentPage] && (
                <div className="flex items-center justify-center bg-slate-800 rounded-lg min-h-[600px]">
                  <div className="text-center">
                    <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white mb-4">Error al cargar la página {currentPage + 1}</p>
                    <button
                      onClick={retryCurrentPage}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image */}
              {!imageErrors[currentPage] && (
                <Image
                  src={currentPageUrl}
                  alt={`Página ${currentPage + 1}`}
                  width={800}
                  height={1200}
                  className={`${
                    fitToWidth ? 'w-full h-auto' : 'max-w-full h-auto'
                  } rounded-lg shadow-2xl ${imageLoadingStates[currentPage] ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => handleImageLoad(currentPage)}
                  onError={() => handleImageError(currentPage)}
                  priority
                  unoptimized // Importante para imágenes externas
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
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={previousPage}
            disabled={currentPage === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Page Navigator */}
          <div className="flex items-center space-x-2">
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index} value={index}>
                  Página {index + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === totalPages - 1
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <span>Siguiente</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
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