'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mangaDexService } from '@/services/mangadex';
import FeaturedCarousel from '@/components/common/FeaturedCarousel';
import Carousel from '@/components/common/Carousel';
import { MangaCardCompact } from '@/components/manga/MangaCardCompact';
import AIRecommendations from '@/components/ai/AIRecommendations';
import { useMangaStore } from '@/store/mangaStore';
import type { Manga } from '@/types/manga';

export default function HomePage() {
  const [featured, setFeatured] = useState<Manga[]>([]);
  const [popular, setPopular] = useState<Manga[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Manga[]>([]);
  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { favorites } = useMangaStore();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularData, recentlyAddedData, trendingData] = await Promise.all([
          mangaDexService.getPopularManga(20, 0),
          mangaDexService.searchManga('', ['en', 'es'], 20, 0),
          mangaDexService.getPopularManga(20, 20)
        ]);

        setFeatured(popularData.data.slice(0, 5));
        setPopular(popularData.data.slice(0, 16));
        setRecentlyAdded(recentlyAddedData.data.slice(0, 16));
        setTrending(trendingData.data.slice(0, 16));
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleMangaClick = (mangaId: string) => {
    router.push(`/manga/${mangaId}`);
  };

  const renderMangaCards = (mangas: Manga[]) => {
    return mangas.map((manga) => (
      <div key={manga.id} className="w-44 flex-shrink-0">
        <MangaCardCompact
          manga={manga}
          variant="grid"
        />
      </div>
    ));
  };

  const renderSkeletonCards = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="w-44 flex-shrink-0">
        <div className="bg-slate-700 animate-pulse rounded-lg">
          <div className="aspect-[3/4] bg-slate-600 rounded-t-lg"></div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-slate-600 rounded"></div>
            <div className="h-3 bg-slate-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="space-y-8">
        {/* Featured Carousel with Integrated Header */}
        <FeaturedCarousel 
          mangas={featured} 
          onMangaClick={handleMangaClick}
          onSearch={handleSearch}
          className="pb-4"
        />

        {/* AI Recommendations */}
        <section className="container mx-auto px-4">
          <AIRecommendations />
        </section>

        {/* Popular Manga Carousel */}
        <section className="container mx-auto px-4">
          <Carousel
            title="Populares"
            viewAllLink="/popular"
          >
            {loading ? renderSkeletonCards(8) : renderMangaCards(popular)}
          </Carousel>
        </section>

        {/* Recently Added Carousel */}
        <section className="container mx-auto px-4">
          <Carousel
            title="Recién Agregados"
            viewAllLink="/library"
          >
            {loading ? renderSkeletonCards(8) : renderMangaCards(recentlyAdded)}
          </Carousel>
        </section>

        {/* Trending Manga Carousel */}
        <section className="container mx-auto px-4">
          <Carousel
            title="Tendencias"
            viewAllLink="/popular"
          >
            {loading ? renderSkeletonCards(8) : renderMangaCards(trending)}
          </Carousel>
        </section>

        {/* User Favorites */}
        {favorites.length > 0 && (
          <section className="container mx-auto px-4 pb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Tus Favoritos
                </h2>
                {favorites.length > 10 && (
                  <button
                    onClick={() => router.push('/favorites')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Ver todos ({favorites.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favorites.slice(0, 10).map((favorite) => (
                  <div
                    key={favorite.id}
                    onClick={() => handleMangaClick(favorite.id)}
                    className="cursor-pointer group"
                  >
                    <div className="relative aspect-[3/4] bg-slate-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
                      <img
                        src={favorite.coverUrl}
                        alt={favorite.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                    </div>
                    <h3 className="text-white text-sm font-medium mt-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {favorite.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
