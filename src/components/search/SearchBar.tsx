'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiX, FiTrendingUp, FiBook, FiLoader } from 'react-icons/fi';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  year: number;
  tags: string[];
}

const popularSuggestions = [
  'One Piece', 'Naruto', 'Attack on Titan', 'Demon Slayer', 
  'My Hero Academia', 'Death Note', 'Dragon Ball', 'Bleach'
];

export function SearchBar({ 
  onSearch, 
  placeholder = "Buscar manga...", 
  showSuggestions = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await mangaDexService.searchManga(searchQuery, ['en', 'es'], 8);
        const results: SearchResult[] = response.data.map((manga: Manga) => {
          // Find cover art
          const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
          const coverUrl = coverArt 
            ? mangaDexService.getCoverUrl(manga.id, coverArt.attributes?.fileName || '', 'small')
            : '';

          // Get title in preferred language
          const title = manga.attributes.title.en || 
                       manga.attributes.title.es || 
                       manga.attributes.title['ja-ro'] || 
                       Object.values(manga.attributes.title)[0] || 
                       'Sin título';

          // Get description
          const description = manga.attributes.description.en || 
                             manga.attributes.description.es || 
                             Object.values(manga.attributes.description)[0] || 
                             'Sin descripción';

          return {
            id: manga.id,
            title,
            description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
            coverUrl,
            year: manga.attributes.year || 0,
            tags: manga.attributes.tags.slice(0, 3).map(tag => 
              tag.attributes.name.en || tag.attributes.name.es || Object.values(tag.attributes.name)[0]
            )
          };
        });

        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        console.error('Error searching manga:', error);
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Debounce search with useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && showSuggestionsDropdown) {
        debouncedSearch(query.trim());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch, showSuggestionsDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestionsDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setShowSuggestionsDropdown(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();
  };

  const handleMangaClick = (mangaId: string) => {
    router.push(`/manga/${mangaId}`);
    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestionsDropdown(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestionsDropdown(false);
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-200 ${
          isFocused 
            ? 'transform scale-[1.02] shadow-lg shadow-purple-500/20' 
            : 'shadow-md'
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full pl-12 pr-12 py-4 text-lg bg-white/5 backdrop-blur-md border rounded-xl text-white placeholder-slate-400 focus:outline-none transition-all duration-200 ${
              isFocused 
                ? 'border-purple-400 bg-white/10' 
                : 'border-white/20 hover:border-white/30'
            }`}
          />
          
          {/* Search Icon */}
          <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            isFocused ? 'text-purple-400' : 'text-slate-400'
          }`} />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showSuggestionsDropdown && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden max-h-96">
          {/* Show search results if there's a query */}
          {query.trim() && (
            <>
              {isSearching && (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Buscando...</span>
                  </div>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((manga) => (
                    <button
                      key={manga.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMangaClick(manga.id);
                      }}
                                            className="w-full p-3 text-left hover:bg-gradient-to-r hover:from-purple-600/25 hover:to-pink-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-b border-slate-700/30 hover:border-purple-400/40 last:border-b-0 group relative overflow-hidden"
                    >
                        {/* Efecto de brillo en hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </div>
                        
                        <div className="flex items-start space-x-3 relative z-10">
                          <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow duration-200">
                            {manga.coverUrl ? (
                              <Image
                                src={manga.coverUrl}
                                alt={manga.title}
                                width={48}
                                height={64}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiBook className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-colors duration-200" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate group-hover:text-purple-200 transition-colors duration-200">{manga.title}</h3>
                          {manga.year > 0 && (
                            <p className="text-xs text-slate-400 mt-1">{manga.year}</p>
                          )}
                          {manga.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {manga.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {manga.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && (
                <div className="p-4 text-center">
                  <div className="text-slate-400 text-sm">
                    No se encontraron resultados para &quot;{query}&quot;
                  </div>
                </div>
              )}
            </>
          )}

          {/* Show popular suggestions only when no query */}
          {!query.trim() && (
            <>
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <FiTrendingUp className="w-4 h-4" />
                  <span>Búsquedas populares</span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {popularSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(suggestion);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-gradient-to-r hover:from-purple-600/25 hover:to-pink-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 border-b border-slate-700/30 last:border-b-0 group"
                  >
                    <div className="flex items-center space-x-3">
                      <FiSearch className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200" />
                      <span className="group-hover:text-purple-200 transition-colors duration-200">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 