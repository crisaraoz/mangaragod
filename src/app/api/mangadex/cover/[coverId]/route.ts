import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_API_BASE = process.env.NEXT_PUBLIC_MANGADEX_API_URL || 'https://api.mangadex.org';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coverId: string }> }
) {
  try {
    const { coverId } = await params;
    
    // Construir la URL para la API de MangaDex
    const mangadexUrl = new URL(`/cover/${coverId}`, MANGADEX_API_BASE);

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
    console.error('Error in cover API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cover data' },
      { status: 500 }
    );
  }
} 