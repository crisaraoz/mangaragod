'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    setShowSuggestionsDropdown(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && !query) {
      setShowSuggestionsDropdown(true);
    }
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
    
    if (showSuggestions) {
      setShowSuggestionsDropdown(value.length === 0);
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

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
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
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-white hover:bg-purple-600/20 transition-colors duration-150 border-b border-slate-700/30 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <FiSearch className="w-4 h-4 text-slate-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 