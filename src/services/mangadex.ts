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

  // Obtener URL de la imagen de portada
  getCoverUrl(mangaId: string, fileName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: '256',
      medium: '512',
      large: '1024'
    };
    const coversBaseUrl = process.env.NEXT_PUBLIC_MANGADEX_COVERS_URL || 'https://uploads.mangadex.org/covers';
    
    // Según la documentación oficial de MangaDex:
    // Para miniaturas: https://uploads.mangadex.org/covers/:manga-id/:cover-filename.{256,512}.jpg
    // IMPORTANTE: Se mantiene el nombre completo del archivo CON su extensión original
    // Ejemplo: archivo.png -> archivo.png.256.jpg
    
    if (size === 'large') {
      // Para tamaño grande, usar la imagen original sin thumbnail
      return `${coversBaseUrl}/${mangaId}/${fileName}`;
    } else {
      // Para small/medium, usar thumbnails con formato: filename.extension.size.jpg
      return `${coversBaseUrl}/${mangaId}/${fileName}.${sizeMap[size]}.jpg`;
    }
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
}

export default new MangaDexService();
export const mangaDexService = new MangaDexService(); 