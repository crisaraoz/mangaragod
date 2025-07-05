/* eslint-disable @typescript-eslint/no-unused-vars */
import OpenAI from 'openai';
import { mangaDexService } from './mangadex';
import type { Manga, FavoriteManga } from '@/types/manga';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

export interface AIRecommendation {
  manga: Manga;
  reason: string;
  confidence: number;
  category: 'similar_genre' | 'same_author' | 'trending' | 'hidden_gem';
}

class AIRecommendationsService {
  private cache: Map<string, AIRecommendation[]> = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas

  async generateRecommendations(
    favorites: FavoriteManga[],
    limit: number = 10
  ): Promise<AIRecommendation[]> {
    try {
      if (favorites.length === 0) {
        return await this.getPopularRecommendations(limit);
      }

      const cacheKey = this.getCacheKey(favorites);
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached.slice(0, limit);
      }

      // Analizar biblioteca del usuario
      const userProfile = await this.analyzeUserLibrary(favorites);
      
      // Buscar recomendaciones basadas en el perfil
      const recommendations = await this.searchRecommendations(userProfile, limit);
      
      // Cachear resultados
      this.cache.set(cacheKey, recommendations);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  private async analyzeUserLibrary(favorites: FavoriteManga[]): Promise<UserProfile> {
    const favoriteGenres = await this.extractGenres(favorites);
    const favoriteAuthors = await this.extractAuthors(favorites);
    const readingPatterns = this.analyzeReadingPatterns(favorites);

    try {
      const prompt = `
        Analiza el perfil de lectura de manga del usuario:
        
        Géneros favoritos: ${favoriteGenres.join(', ')}
        Autores favoritos: ${favoriteAuthors.join(', ')}
        Patrones de lectura: ${JSON.stringify(readingPatterns)}
        
        Basándote en estos datos, genera un perfil de recomendaciones que incluya:
        1. Géneros similares o relacionados que podrían gustar
        2. Tipos de historia que probablemente disfrute
        3. Elementos temáticos importantes
        4. Nivel de complejidad preferido
        
        Responde en JSON con la estructura:
        {
          "preferredGenres": ["genre1", "genre2"],
          "storyTypes": ["type1", "type2"],
          "themes": ["theme1", "theme2"],
          "complexity": "beginner|intermediate|advanced",
          "recommendations": ["search_term1", "search_term2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error analyzing user library with AI:', error);
    }

    // Fallback analysis
    return {
      preferredGenres: favoriteGenres.slice(0, 3),
      storyTypes: ['adventure', 'drama'],
      themes: ['friendship', 'growth'],
      complexity: 'intermediate',
      recommendations: favoriteGenres.slice(0, 2)
    };
  }

  private async searchRecommendations(
    profile: UserProfile,
    limit: number
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    
    // Buscar por géneros preferidos
    for (const searchTerm of profile.recommendations) {
      try {
        const searchResults = await mangaDexService.searchManga(
          searchTerm,
          ['en', 'es'],
          10,
          0
        );
        
        for (const manga of searchResults.data) {
          if (recommendations.length >= limit) break;
          
          const reason = await this.generateRecommendationReason(manga, profile);
          const confidence = this.calculateConfidence(manga, profile);
          
          recommendations.push({
            manga,
            reason,
            confidence,
            category: this.determineCategory(manga, profile)
          });
        }
      } catch (error) {
        console.error('Error searching recommendations:', error);
      }
    }

    // Ordenar por confianza
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  private async generateRecommendationReason(
    manga: Manga,
    profile: UserProfile
  ): Promise<string> {
    const title = manga.attributes.title.en || 
                 manga.attributes.title[Object.keys(manga.attributes.title)[0]];
    
    const genres = manga.attributes.tags
      ?.filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en)
      .slice(0, 3) || [];

    try {
      const prompt = `
        Genera una razón personalizada y atractiva (máximo 100 caracteres) de por qué este manga podría gustarle al usuario:
        
        Manga: ${title}
        Géneros: ${genres.join(', ')}
        Perfil del usuario: ${JSON.stringify(profile)}
        
        La razón debe ser específica, personal y motivadora. Ejemplos:
        - "Por tu amor al fantasy, este isekai te encantará"
        - "Similar a tus favoritos de acción con mechas"
        - "Combina romance y drama como te gusta"
        
        Responde solo con la razón, sin comillas ni explicaciones adicionales.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.8
      });

      return response.choices[0]?.message?.content?.trim() || 
             `Recomendado por tus intereses en ${genres[0] || 'manga'}`;
    } catch (error) {
      console.error('Error generating recommendation reason:', error);
      return `Basado en tus gustos de ${genres[0] || 'manga'}`;
    }
  }

  private calculateConfidence(manga: Manga, profile: UserProfile): number {
    let confidence = 0.5; // Base confidence
    
    const mangaGenres = manga.attributes.tags
      ?.filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en) || [];
    
    // Bonus por géneros coincidentes
    const genreMatches = mangaGenres.filter(genre => 
      profile.preferredGenres.includes(genre)
    ).length;
    
    confidence += genreMatches * 0.2;
    
    // Bonus por rating alto
    if (manga.attributes.contentRating === 'safe') {
      confidence += 0.1;
    }
    
    // Bonus por estado completado
    if (manga.attributes.status === 'completed') {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  private determineCategory(manga: Manga, profile: UserProfile): AIRecommendation['category'] {
    const mangaGenres = manga.attributes.tags
      ?.filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en) || [];
    
    if (mangaGenres.some(genre => profile.preferredGenres.includes(genre))) {
      return 'similar_genre';
    }
    
    if (manga.attributes.year && manga.attributes.year > 2020) {
      return 'trending';
    }
    
    return 'hidden_gem';
  }

  private async getPopularRecommendations(limit: number): Promise<AIRecommendation[]> {
    try {
      const popular = await mangaDexService.getPopularManga(limit, 0);
      return popular.data.map(manga => ({
        manga,
        reason: 'Popular entre los lectores',
        confidence: 0.7,
        category: 'trending' as const
      }));
    } catch (error) {
      console.error('Error getting popular recommendations:', error);
      return [];
    }
  }

  private async getFallbackRecommendations(limit: number): Promise<AIRecommendation[]> {
    return await this.getPopularRecommendations(limit);
  }

  private getCacheKey(favorites: FavoriteManga[]): string {
    return favorites
      .map(f => f.id)
      .sort()
      .join('|');
  }

  private async extractGenres(favorites: FavoriteManga[]): Promise<string[]> {
    const genreCount: Record<string, number> = {};
    
    // En una implementación real, necesitaríamos obtener los géneros de cada manga
    // Por ahora, usamos géneros comunes como ejemplo
    const commonGenres = [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
      'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural'
    ];
    
    return commonGenres.slice(0, 3);
  }

  private async extractAuthors(favorites: FavoriteManga[]): Promise<string[]> {
    // En una implementación real, extraeríamos autores de los mangas favoritos
    return ['Various Authors'];
  }

  private analyzeReadingPatterns(favorites: FavoriteManga[]): ReadingPatterns {
    return {
      totalMangas: favorites.length,
      averageReadingFrequency: 'weekly',
      preferredStatuses: ['completed', 'ongoing'],
      lastActivity: new Date().toISOString()
    };
  }
}

interface UserProfile {
  preferredGenres: string[];
  storyTypes: string[];
  themes: string[];
  complexity: string;
  recommendations: string[];
}

interface ReadingPatterns {
  totalMangas: number;
  averageReadingFrequency: string;
  preferredStatuses: string[];
  lastActivity: string;
}

export const aiRecommendationsService = new AIRecommendationsService(); 