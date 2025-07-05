'use client';

import React, { useState, useEffect } from 'react';
import { mangaDexService } from '@/services/mangadex';

interface ImageDebugProps {
  mangaId: string;
  fileName: string;
  className?: string;
}

const ImageDebug: React.FC<ImageDebugProps> = ({ mangaId, fileName, className = '' }) => {
  const [debugInfo, setDebugInfo] = useState<{
    small: string;
    medium: string;
    large: string;
    status: {
      small: 'loading' | 'success' | 'error';
      medium: 'loading' | 'success' | 'error';
      large: 'loading' | 'success' | 'error';
    };
  }>({
    small: '',
    medium: '',
    large: '',
    status: {
      small: 'loading',
      medium: 'loading',
      large: 'loading'
    }
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const urls = {
      small: mangaDexService.getCoverUrl(mangaId, fileName, 'small'),
      medium: mangaDexService.getCoverUrl(mangaId, fileName, 'medium'),
      large: mangaDexService.getCoverUrl(mangaId, fileName, 'large')
    };

    setDebugInfo(prev => ({
      ...prev,
      ...urls
    }));

    // Probar cada URL
    const testUrl = async (url: string, size: 'small' | 'medium' | 'large') => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        setDebugInfo(prev => ({
          ...prev,
          status: {
            ...prev.status,
            [size]: response.ok ? 'success' : 'error'
          }
        }));
      } catch {
        setDebugInfo(prev => ({
          ...prev,
          status: {
            ...prev.status,
            [size]: 'error'
          }
        }));
      }
    };

    testUrl(urls.small, 'small');
    testUrl(urls.medium, 'medium');
    testUrl(urls.large, 'large');
  }, [mangaId, fileName]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-mono"
      >
        🐛 Debug
      </button>

      {isVisible && (
        <div className="mt-2 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono">
          <h4 className="font-bold mb-2">Image Debug Info</h4>
          
          <div className="space-y-2">
            <div>
              <strong>Manga ID:</strong> {mangaId}
            </div>
            <div>
              <strong>File Name:</strong> {fileName}
            </div>
            
            <div className="mt-3">
              <strong>URLs:</strong>
            </div>
            
            {(['small', 'medium', 'large'] as const).map(size => (
              <div key={size} className="ml-2">
                <div className="flex items-center space-x-2">
                  <span className="w-16">{size}:</span>
                  <div className={`w-2 h-2 rounded-full ${
                    debugInfo.status[size] === 'loading' ? 'bg-yellow-500' :
                    debugInfo.status[size] === 'success' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                </div>
                <div className="break-all text-gray-300">
                  {debugInfo[size]}
                </div>
                {debugInfo.status[size] === 'success' && (
                  <div className="mt-1">
                    <img 
                      src={debugInfo[size]} 
                      alt={`${size} preview`}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-gray-400">
              <div>✅ Success: URL válida</div>
              <div>❌ Error: URL inválida</div>
              <div>⏳ Loading: Verificando...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDebug; 