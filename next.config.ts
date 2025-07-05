import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        port: '',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.org',
        port: '',
        pathname: '/**',
      },
      // Patrones para servidores de páginas de capítulos
      {
        protocol: 'https',
        hostname: '*.mangadex.network',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.org',
        port: '',
        pathname: '/**',
      },
    ],
    // Configuración adicional para imágenes
          domains: [
        'uploads.mangadex.org',
        'mangadex.org',
      ],
    // Configuración para manejar errores de imágenes
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configuración para proxy API y evitar CORS
  async rewrites() {
    return [
      {
        source: '/api/mangadex/:path*',
        destination: 'https://api.mangadex.org/:path*',
      },
    ];
  },
};

export default nextConfig;
