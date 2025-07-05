/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipos para la API de MangaDex
export interface MangaResponse {
  result: string;
  response: string;
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
}

export interface Manga {
  id: string;
  type: string;
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface MangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  isLocked: boolean;
  links: Record<string, string>;
  originalLanguage: string;
  lastVolume: string;
  lastChapter: string;
  publicationDemographic: string;
  status: string;
  year: number;
  contentRating: string;
  tags: Tag[];
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string;
}

export interface Tag {
  id: string;
  type: string;
  attributes: TagAttributes;
  relationships: any[];
}

export interface TagAttributes {
  name: Record<string, string>;
  description: Record<string, string>;
  group: string;
  version: number;
}

export interface Relationship {
  id: string;
  type: string;
  attributes?: any;
  related?: string;
}

export interface Chapter {
  id: string;
  type: string;
  attributes: ChapterAttributes;
  relationships: Relationship[];
}

export interface ChapterAttributes {
  title: string;
  volume: string;
  chapter: string;
  pages: number;
  translatedLanguage: string;
  uploader: string;
  externalUrl: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishAt: string;
  readableAt: string;
}

export interface ChapterResponse {
  result: string;
  response: string;
  data: Chapter[];
  limit: number;
  offset: number;
  total: number;
}

export interface AtHomeResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface CoverArt {
  id: string;
  type: string;
  attributes: CoverArtAttributes;
  relationships: Relationship[];
}

export interface CoverArtAttributes {
  description: string;
  volume: string;
  fileName: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ReadingProgress {
  mangaId: string;
  lastChapterId: string;
  lastChapterNumber: string;
  progress: number;
  updatedAt: string;
}

export interface FavoriteManga {
  id: string;
  title: string;
  coverUrl: string;
  status: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
  addedAt: string;
  lastReadAt?: string;
} 