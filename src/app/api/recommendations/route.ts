import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { mangaDexService } from '@/services/mangadex';
import type { Manga, FavoriteManga } from '@/types/manga';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIRecommendation {
  manga: Manga;
  reason: string;
  confidence: number;
  category: 'similar_genre' | 'same_author' | 'trending' | 'hidden_gem';
}

export async function POST(request: NextRequest) {
  try {
    const { favorites, limit = 10 } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const recommendations = await generateRecommendations(favorites, limit);
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

async function generateRecommendations(
  favorites: FavoriteManga[],
  limit: number
): Promise<AIRecommendation[]> {
  try {
    if (favorites.length === 0) {
      return await getPopularRecommendations(limit);
    }

    // Analizar biblioteca del usuario
    const userProfile = await analyzeUserLibrary(favorites);
    
    // Buscar recomendaciones basadas en el perfil
    const recommendations = await searchRecommendations(userProfile, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return await getPopularRecommendations(limit);
  }
}

async function analyzeUserLibrary(favorites: FavoriteManga[]): Promise<UserProfile> {
  const favoriteGenres = extractGenres(favorites);
  const readingPatterns = analyzeReadingPatterns(favorites);

  try {
    const prompt = `
      Analiza el perfil de lectura de manga del usuario:
      
      Número de favoritos: ${favorites.length}
      Géneros preferidos comunes: Action, Adventure, Comedy, Drama, Fantasy, Romance, Sci-Fi, Slice of Life
      Patrones de lectura: ${JSON.stringify(readingPatterns)}
      
      Basándote en estos datos, genera un perfil de recomendaciones que incluya:
      1. 3 géneros que probablemente le gusten
      2. 2 términos de búsqueda para encontrar mangas similares
      
      Responde en JSON con la estructura:
      {
        "preferredGenres": ["genre1", "genre2", "genre3"],
        "searchTerms": ["term1", "term2"],
        "complexity": "beginner|intermediate|advanced"
      }
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7")
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        preferredGenres: parsed.preferredGenres || favoriteGenres,
        searchTerms: parsed.searchTerms || ['action', 'adventure'],
        complexity: parsed.complexity || 'intermediate'
      };
    }
  } catch (error) {
    console.error('Error analyzing user library with AI:', error);
  }

  // Fallback analysis
  return {
    preferredGenres: favoriteGenres,
    searchTerms: ['action', 'adventure'],
    complexity: 'intermediate'
  };
}

async function searchRecommendations(
  profile: UserProfile,
  limit: number
): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];
  
  // Buscar por términos de búsqueda
  for (const searchTerm of profile.searchTerms) {
    try {
      const searchResults = await mangaDexService.searchManga(
        searchTerm,
        ['en', 'es'],
        10,
        0
      );
      
      for (const manga of searchResults.data) {
        if (recommendations.length >= limit) break;
        
        const reason = await generateRecommendationReason(manga, profile);
        const confidence = calculateConfidence(manga, profile);
        
        recommendations.push({
          manga,
          reason,
          confidence,
          category: determineCategory(manga, profile)
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

async function generateRecommendationReason(
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
      Genera una razón corta y atractiva (máximo 80 caracteres) de por qué este manga podría gustarle al usuario:
      
      Manga: ${title}
      Géneros: ${genres.join(', ')}
      Usuario prefiere: ${profile.preferredGenres.join(', ')}
      
      Ejemplos de respuestas:
      - "Por tu amor al fantasy, este isekai te encantará"
      - "Acción épica como te gusta"
      - "Combina romance y aventura perfectamente"
      
      Responde solo con la razón, sin comillas.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 30,
      temperature: 0.8
    });

    const reason = response.choices[0]?.message?.content?.trim();
    return reason || `Recomendado por tus gustos de ${genres[0] || 'manga'}`;
  } catch (error) {
    console.error('Error generating recommendation reason:', error);
    return `Basado en tus gustos de ${genres[0] || 'manga'}`;
  }
}

function calculateConfidence(manga: Manga, profile: UserProfile): number {
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

function determineCategory(manga: Manga, profile: UserProfile): AIRecommendation['category'] {
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

async function getPopularRecommendations(limit: number): Promise<AIRecommendation[]> {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractGenres(_favorites: FavoriteManga[]): string[] {
  // Por ahora retornamos géneros comunes
  // En una implementación real, obtendríamos los géneros de los mangas favoritos
  return ['Action', 'Adventure', 'Fantasy'];
}

function analyzeReadingPatterns(favorites: FavoriteManga[]): ReadingPatterns {
  return {
    totalMangas: favorites.length,
    averageReadingFrequency: 'weekly',
    preferredStatuses: ['completed', 'ongoing'],
    lastActivity: new Date().toISOString()
  };
}

interface UserProfile {
  preferredGenres: string[];
  searchTerms: string[];
  complexity: string;
}

interface ReadingPatterns {
  totalMangas: number;
  averageReadingFrequency: string;
  preferredStatuses: string[];
  lastActivity: string;
} 