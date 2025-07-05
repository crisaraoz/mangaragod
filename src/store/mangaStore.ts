import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FavoriteManga, ReadingProgress, Manga } from '@/types/manga';

interface MangaState {
  // Favoritos
  favorites: FavoriteManga[];
  addToFavorites: (manga: Manga, status: FavoriteManga['status']) => void;
  removeFromFavorites: (mangaId: string) => void;
  updateFavoriteStatus: (mangaId: string, status: FavoriteManga['status']) => void;
  getFavoriteByStatus: (status: FavoriteManga['status']) => FavoriteManga[];
  
  // Progreso de lectura
  readingProgress: ReadingProgress[];
  updateReadingProgress: (progress: ReadingProgress) => void;
  getReadingProgress: (mangaId: string) => ReadingProgress | undefined;
  
  // Historial de lectura
  readingHistory: string[];
  addToHistory: (mangaId: string) => void;
  
  // Recomendaciones
  recommendations: Manga[];
  setRecommendations: (recommendations: Manga[]) => void;
  
  // Configuración
  settings: {
    defaultLanguage: string[];
    dataSaver: boolean;
    autoMarkAsRead: boolean;
  };
  updateSettings: (settings: Partial<MangaState['settings']>) => void;
}

export const useMangaStore = create<MangaState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      favorites: [],
      readingProgress: [],
      readingHistory: [],
      recommendations: [],
      settings: {
        defaultLanguage: ['en'],
        dataSaver: false,
        autoMarkAsRead: true,
      },

      // Funciones para favoritos
      addToFavorites: (manga, status) => {
        const { favorites } = get();
        const existingIndex = favorites.findIndex(fav => fav.id === manga.id);
        
        if (existingIndex >= 0) {
          // Si ya existe, actualizar el status
          const updatedFavorites = [...favorites];
          updatedFavorites[existingIndex] = {
            ...updatedFavorites[existingIndex],
            status,
            lastReadAt: new Date().toISOString(),
          };
          set({ favorites: updatedFavorites });
        } else {
          // Si no existe, agregar nuevo
          const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
          const coverUrl = coverArt?.attributes?.fileName 
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`
            : '/placeholder-cover.jpg';
          
          const newFavorite: FavoriteManga = {
            id: manga.id,
            title: manga.attributes.title.en || manga.attributes.title[Object.keys(manga.attributes.title)[0]],
            coverUrl,
            status,
            addedAt: new Date().toISOString(),
            lastReadAt: new Date().toISOString(),
          };
          
          set({ favorites: [...favorites, newFavorite] });
        }
      },

      removeFromFavorites: (mangaId) => {
        const { favorites } = get();
        set({ favorites: favorites.filter(fav => fav.id !== mangaId) });
      },

      updateFavoriteStatus: (mangaId, status) => {
        const { favorites } = get();
        const updatedFavorites = favorites.map(fav => 
          fav.id === mangaId 
            ? { ...fav, status, lastReadAt: new Date().toISOString() }
            : fav
        );
        set({ favorites: updatedFavorites });
      },

      getFavoriteByStatus: (status) => {
        const { favorites } = get();
        return favorites.filter(fav => fav.status === status);
      },

      // Funciones para progreso de lectura
      updateReadingProgress: (progress) => {
        const { readingProgress } = get();
        const existingIndex = readingProgress.findIndex(p => p.mangaId === progress.mangaId);
        
        if (existingIndex >= 0) {
          const updatedProgress = [...readingProgress];
          updatedProgress[existingIndex] = {
            ...progress,
            updatedAt: new Date().toISOString(),
          };
          set({ readingProgress: updatedProgress });
        } else {
          set({ 
            readingProgress: [...readingProgress, {
              ...progress,
              updatedAt: new Date().toISOString(),
            }]
          });
        }
      },

      getReadingProgress: (mangaId) => {
        const { readingProgress } = get();
        return readingProgress.find(p => p.mangaId === mangaId);
      },

      // Funciones para historial
      addToHistory: (mangaId) => {
        const { readingHistory } = get();
        const updatedHistory = [mangaId, ...readingHistory.filter(id => id !== mangaId)];
        // Mantener solo los últimos 50 mangas en el historial
        if (updatedHistory.length > 50) {
          updatedHistory.splice(50);
        }
        set({ readingHistory: updatedHistory });
      },

      // Funciones para recomendaciones
      setRecommendations: (recommendations) => {
        set({ recommendations });
      },

      // Funciones para configuración
      updateSettings: (newSettings) => {
        const { settings } = get();
        set({ settings: { ...settings, ...newSettings } });
      },
    }),
    {
      name: 'manga-reader-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 