'use client';

import React, { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';

interface CarouselProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
  onViewAll?: () => void;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ 
  title, 
  children, 
  viewAllLink, 
  onViewAll, 
  className = '' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Reducido para cards más pequeñas
      const newScrollLeft = scrollRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (viewAllLink) {
      window.location.href = viewAllLink;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        
        <div className="flex items-center space-x-2">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-md transition-colors ${
                canScrollLeft
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-md transition-colors ${
                canScrollRight
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View All Button */}
          {(viewAllLink || onViewAll) && (
            <button
              onClick={handleViewAll}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span className="text-sm font-medium">Ver todo</span>
              <FiArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Carousel Content */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Carousel; 