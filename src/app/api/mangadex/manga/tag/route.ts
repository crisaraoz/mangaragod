import { NextResponse } from 'next/server';

const MANGADEX_API_BASE = process.env.NEXT_PUBLIC_MANGADEX_API_URL || 'https://api.mangadex.org';

export async function GET() {
  try {
    // Construir la URL para la API de MangaDex
    const mangadexUrl = new URL('/manga/tag', MANGADEX_API_BASE);

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
    console.error('Error in manga tag API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga tags' },
      { status: 500 }
    );
  }
} 