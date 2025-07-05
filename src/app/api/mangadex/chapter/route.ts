import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_API_BASE = process.env.NEXT_PUBLIC_MANGADEX_API_URL || 'https://api.mangadex.org';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir la URL para la API de MangaDex
    const mangadexUrl = new URL('/chapter', MANGADEX_API_BASE);
    
    // Pasar todos los parámetros de búsqueda
    searchParams.forEach((value, key) => {
      mangadexUrl.searchParams.append(key, value);
    });

    const response = await fetch(mangadexUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MangaDex API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chapter API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter data' },
      { status: 500 }
    );
  }
} 