'use client';

import { FiBook, FiImage, FiAlertCircle } from 'react-icons/fi';

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  title?: string;
  showError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ImagePlaceholder({ 
  width, 
  height, 
  title, 
  showError = false, 
  size = 'md',
  className = ''
}: ImagePlaceholderProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`
        flex flex-col items-center justify-center 
        bg-gradient-to-br from-slate-700 to-slate-800 
        border-2 border-dashed border-slate-600 
        rounded-lg text-slate-500 
        ${className}
      `}
      style={{ width, height }}
    >
      {showError ? (
        <FiAlertCircle className={`${sizeMap[size]} mb-2 text-red-400`} />
      ) : title ? (
        <FiBook className={`${sizeMap[size]} mb-2`} />
      ) : (
        <FiImage className={`${sizeMap[size]} mb-2`} />
      )}
      
      <span className={`${textSizeMap[size]} text-center px-2 leading-tight`}>
        {showError ? 'Error al cargar' : title ? 'Sin portada' : 'Imagen no disponible'}
      </span>
      
      {title && (
        <span className="text-xs text-slate-600 text-center px-2 mt-1 line-clamp-2">
          {title}
        </span>
      )}
    </div>
  );
} 