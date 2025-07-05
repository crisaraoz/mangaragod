import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mangaId: string; fileName: string }> }
) {
  try {
    const { mangaId, fileName } = await params;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || 'medium';
    
    // Construir la URL original de MangaDex
    const sizeMap = {
      small: '256',
      medium: '512',
      large: '1024'
    };
    
    let imageUrl;
    if (size === 'large') {
      imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    } else {
      imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${sizeMap[size as keyof typeof sizeMap]}.jpg`;
    }
    
    // Fetch la imagen desde MangaDex
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mangadex.org/',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    // Obtener el tipo de contenido y el buffer de la imagen
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();
    
    // Configurar headers para el cache
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 horas
      'Content-Length': imageBuffer.byteLength.toString(),
    });
    
    return new NextResponse(imageBuffer, { headers });
    
  } catch (error) {
    console.error('Error proxying cover image:', error);
    
    // Retornar una imagen placeholder en caso de error
    return NextResponse.redirect('/placeholder-cover.svg', 302);
  }
} 