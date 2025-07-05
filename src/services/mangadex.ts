/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';
import type { 
  MangaResponse, 
  ChapterResponse, 
  AtHomeResponse, 
  Manga 
} from '@/types/manga';

// Detectar si estamos en el servidor o en el cliente
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer 
  ? process.env.NEXT_PUBLIC_MANGADEX_API_URL || 'https://api.mangadex.org'
  : '/api/mangadex';

class MangaDexService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Buscar mangas por título
  async searchManga(
    title: string, 
    language: string[] = ['en'], 
    limit: number = 20,
    offset: number = 0
  ): Promise<MangaResponse> {
    try {
      const response = await this.api.get('/manga', {
        params: {
          title,
          availableTranslatedLanguage: language,
          limit,
          offset,
          includes: ['cover_art', 'author', 'artist'],
          order: { relevance: 'desc' },
          contentRating: ['safe', 'suggestive', 'erotica'],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  }

  // Obtener detalles de un manga específico
  async getManga(mangaId: string): Promise<Manga> {
    try {
      const response = await this.api.get(`/manga/${mangaId}`, {
        params: {
          includes: ['cover_art', 'author', 'artist'],
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting manga:', error);
      throw error;
    }
  }

  // Obtener capítulos de un manga
  async getChapters(
    mangaId: string,
    language: string[] = ['en'],
    limit: number = 100,
    offset: number = 0
  ): Promise<ChapterResponse> {
    try {
      const response = await this.api.get('/chapter', {
        params: {
          manga: mangaId,
          translatedLanguage: language,
          limit,
          offset,
          includes: ['scanlation_group'],
          order: { chapter: 'asc' },
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chapters:', error);
      throw error;
    }
  }

  // Obtener feed de capítulos de un manga (usando el endpoint /feed)
  async getMangaFeed(
    mangaId: string,
    options: {
      language?: string[];
      limit?: number;
      offset?: number;
      includeEmptyPages?: 0 | 1;
      includeFuturePublishAt?: 0 | 1;
      includeExternalUrl?: 0 | 1;
      order?: Record<string, 'asc' | 'desc'>;
      includes?: string[];
      contentRating?: string[];
      includeUnavailable?: 0 | 1;
    } = {}
  ): Promise<ChapterResponse> {
    try {
      const {
        language,
        limit = 100,
        offset = 0,
        includeEmptyPages,
        includeFuturePublishAt,
        includeExternalUrl,
        order = { volume: 'desc', chapter: 'desc' },
        includes = ['scanlation_group', 'user'],
        contentRating,
        includeUnavailable = 0,
      } = options;

      const params: Record<string, unknown> = {
        limit,
        offset,
        includes,
        order,
        includeUnavailable,
      };
      if (contentRating !== undefined) params.contentRating = contentRating;
      if (language) params.translatedLanguage = language;
      if (includeEmptyPages !== undefined) params.includeEmptyPages = includeEmptyPages;
      if (includeFuturePublishAt !== undefined) params.includeFuturePublishAt = includeFuturePublishAt;
      if (includeExternalUrl !== undefined) params.includeExternalUrl = includeExternalUrl;

      const response = await this.api.get(`/manga/${mangaId}/feed`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting manga feed:', error);
      throw error;
    }
  }

  // Obtener servidor de páginas para un capítulo
  async getChapterPages(chapterId: string): Promise<AtHomeResponse> {
    try {
      const response = await this.api.get(`/at-home/server/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chapter pages:', error);
      throw error;
    }
  }

  // Obtener URL de la imagen de portada (a través de nuestro proxy)
  getCoverUrl(mangaId: string, fileName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    // Usar nuestra ruta proxy en lugar de la URL directa de MangaDex
    // Esto evita el problema de hotlink en producción
    return `/api/covers/${mangaId}/${fileName}?size=${size}`;
  }

  // Obtener información específica de cover_art
  async getCoverArt(coverId: string): Promise<{ fileName: string } | null> {
    try {
      const response = await this.api.get(`/cover/${coverId}`);
      return {
        fileName: response.data.data.attributes.fileName
      };
    } catch (error) {
      console.error('Error getting cover art:', error);
      return null;
    }
  }

  // Obtener URL de página del capítulo
  getPageUrl(baseUrl: string, chapterHash: string, pageFileName: string, dataSaver: boolean = false): string {
    const quality = dataSaver ? 'data-saver' : 'data';
    return `${baseUrl}/${quality}/${chapterHash}/${pageFileName}`;
  }

  // Obtener mangas populares
  async getPopularManga(limit: number = 20, offset: number = 0): Promise<MangaResponse> {
    try {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          includes: ['cover_art', 'author', 'artist'],
          order: { followedCount: 'desc' },
          contentRating: ['safe', 'suggestive', 'erotica'],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting popular manga:', error);
      throw error;
    }
  }

  // Obtener mangas por tags
  async getMangaByTags(
    includedTags: string[] = [],
    excludedTags: string[] = [],
    limit: number = 20,
    offset: number = 0
  ): Promise<MangaResponse> {
    try {
      const response = await this.api.get('/manga', {
        params: {
          includedTags,
          excludedTags,
          limit,
          offset,
          includes: ['cover_art', 'author', 'artist'],
          order: { followedCount: 'desc' },
          contentRating: ['safe', 'suggestive', 'erotica'],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting manga by tags:', error);
      throw error;
    }
  }

  // Obtener tags disponibles
  async getTags(): Promise<{ id: string; attributes: { name: Record<string, string> } }[]> {
    try {
      const response = await this.api.get('/manga/tag');
      return response.data.data;
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  // Obtener TODOS los capítulos de un manga (maneja paginación automáticamente)
  async getAllChapters(mangaId: string, language: string[] = ['en']): Promise<ChapterResponse> {
    try {
      const allChapters: ChapterResponse['data'] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.getChapters(mangaId, language, limit, offset);
        allChapters.push(...response.data);
        
        // Verificar si hay más capítulos
        hasMore = response.data.length === limit;
        offset += limit;
      }

      return {
        data: allChapters,
        limit: allChapters.length,
        offset: 0,
        total: allChapters.length,
        result: 'ok',
        response: 'collection'
      };
    } catch (error) {
      console.error('Error getting all chapters:', error);
      throw error;
    }
  }

  // Obtener TODOS los capítulos de un manga usando el endpoint /feed (maneja paginación automáticamente)
  async getAllMangaFeedChapters(
    mangaId: string,
    options: {
      // language?: string[];
      limit?: number;
      offset?: number;
      includeEmptyPages?: 0 | 1;
      includeFuturePublishAt?: 0 | 1;
      includeExternalUrl?: 0 | 1;
      order?: Record<string, 'asc' | 'desc'>;
      includes?: string[];
      contentRating?: string[];
      includeUnavailable?: 0 | 1;
    } = {}
  ): Promise<ChapterResponse> {
    try {
      const allChapters: ChapterResponse['data'] = [];
      let offset = 0;
      let limit = 100;
      if (options && Object.prototype.hasOwnProperty.call(options, 'limit')) {
        const opt = options as { limit?: number };
        if (typeof opt.limit === 'number') limit = opt.limit;
      }
      let hasMore = true;

      while (hasMore) {
        const response = await this.getMangaFeed(mangaId, {
          ...options,
          limit,
          offset,
        });
        allChapters.push(...response.data);
        hasMore = response.data.length === limit;
        offset += limit;
      }

      return {
        data: allChapters,
        limit: allChapters.length,
        offset: 0,
        total: allChapters.length,
        result: 'ok',
        response: 'collection'
      };
    } catch (error) {
      console.error('Error getting all manga feed chapters:', error);
      throw error;
    }
  }

  // Obtener metadatos de un capítulo por su ID
  async getChapterById(chapterId: string) {
    try {
      const response = await this.api.get(`/chapter/${chapterId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting chapter by id:', error);
      throw error;
    }
  }
}

export default new MangaDexService();
export const mangaDexService = new MangaDexService(); 