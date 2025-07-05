'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CarouselProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ 
  title, 
  viewAllLink, 
  children, 
  className = '' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Drag/Swipe functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      checkScrollButtons();
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      
      // Check on resize
      const handleResize = () => {
        setTimeout(checkScrollButtons, 100);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.7;
      const newScrollLeft = scrollRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    // Solo iniciar drag si no se está haciendo click en un elemento interactivo
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) {
      return;
    }
    
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScrollLeft(scrollRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const currentX = e.clientX;
    const distance = dragStartX - currentX;
    setDragDistance(Math.abs(distance));
    
    const newScrollLeft = dragStartScrollLeft + distance;
    scrollRef.current.scrollLeft = newScrollLeft;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Si el drag fue significativo, prevenir clicks accidentales
    if (dragDistance > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragStartScrollLeft(scrollRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const distance = dragStartX - currentX;
    setDragDistance(Math.abs(distance));
    
    const newScrollLeft = dragStartScrollLeft + distance;
    scrollRef.current.scrollLeft = newScrollLeft;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Si el drag fue significativo, prevenir clicks accidentales
    if (dragDistance > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile Optimized Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium transition-colors"
          >
            Ver todo →
          </Link>
        )}
      </div>

      {/* Mobile Optimized Carousel Container */}
      <div className="relative group">
        {/* Mobile Optimized Scroll Container with Drag */}
        <div
          ref={scrollRef}
          className={`flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth select-none transition-all duration-200 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: isDragging ? 'auto' : 'smooth'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={`flex-shrink-0 transition-transform duration-200 ${
                isDragging ? 'scale-[0.98]' : 'scale-100'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Desktop Navigation Arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 hidden md:flex"
            aria-label="Anterior"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 hidden md:flex"
            aria-label="Siguiente"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Touch Indicators */}
        <div className="flex justify-center mt-2 md:hidden">
          <div className="flex space-x-1">
            {canScrollLeft && (
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            )}
            <div className="w-2 h-1 bg-purple-500 rounded-full"></div>
            {canScrollRight && (
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Drag Hint */}
        {(canScrollLeft || canScrollRight) && (
          <div className="absolute bottom-0 right-4 text-slate-400 text-xs opacity-50 z-30 hidden lg:block pointer-events-none">
            Arrastra para navegar
          </div>
        )}
      </div>
    </div>
  );
};

export default Carousel; 