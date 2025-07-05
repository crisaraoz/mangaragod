'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiChevronDown } from 'react-icons/fi';
import { SearchBar } from '@/components/search/SearchBar';
import { MangaCardCompact } from '@/components/manga/MangaCardCompact';
import { mangaDexService } from '@/services/mangadex';
import type { Manga } from '@/types/manga';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'es']);
  const [tags, setTags] = useState<{ id: string; attributes: { name: { [key: string]: string } } }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tagsData = await mangaDexService.getTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const response = await mangaDexService.searchManga(
        query,
        selectedLanguages,
        24
      );
      
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    if (!searchQuery.trim() && selectedTags.length === 0) {
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (selectedTags.length > 0) {
        response = await mangaDexService.getMangaByTags(selectedTags, [], 24, 0);
      } else {
        response = await mangaDexService.searchManga(searchQuery, selectedLanguages, 24);
      }
      
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error in advanced search:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const clearAllFilters = () => {
    setSelectedLanguages(['en', 'es']);
    setSelectedTags([]);
    setSelectedStatus('');
    setSortBy('relevance');
  };

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ongoing', label: 'En curso' },
    { value: 'completed', label: 'Completado' },
    { value: 'hiatus', label: 'En pausa' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'latest', label: 'Más reciente' },
    { value: 'oldest', label: 'Más antiguo' },
    { value: 'title', label: 'Título' },
    { value: 'rating', label: 'Calificación' },
    { value: 'follows', label: 'Seguidores' }
  ];

  const languageOptions = [
    { code: 'en', name: 'Inglés' },
    { code: 'es', name: 'Español' },
    { code: 'ja', name: 'Japonés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
  ];

  const LoadingSkeleton = ({ count = 24 }: { count?: number }) => (
    <div className={`grid gap-4 ${viewMode === 'grid' 
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
      : 'grid-cols-1'
    }`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className={`bg-slate-700/50 rounded-lg ${viewMode === 'grid' ? 'h-64' : 'h-20'}`}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Buscar Mangas
          </h1>
          <p className="text-slate-400">
            Encuentra tu próxima lectura favorita con filtros avanzados
          </p>
        </div>
        
        <div className="max-w-2xl">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar manga por título, autor, género..." 
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded-lg border border-slate-700/50 transition-colors"
          >
            <FiFilter className="w-4 h-4 text-purple-400" />
            <span className="text-white">Filtros</span>
            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {(selectedTags.length > 0 || selectedStatus || selectedLanguages.length !== 2) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
            >
              <FiX className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">Limpiar filtros</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Languages */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Idiomas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {languageOptions.map((lang) => (
                  <label key={lang.code} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang.code)}
                      onChange={() => toggleLanguage(lang.code)}
                      className="rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags/Genres */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Géneros</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">
                      {tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Estado</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500"
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Ordenar por</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500"
              >
                {sortOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <button
              onClick={handleAdvancedSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Buscar con filtros
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(selectedTags.length > 0 || selectedStatus || selectedLanguages.length !== 2) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">Filtros activos:</span>
          
          {selectedTags.map((tagId) => {
            const tag = tags.find(t => t.id === tagId);
            return tag && (
              <span
                key={tagId}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{tag.attributes.name.en || tag.attributes.name[Object.keys(tag.attributes.name)[0]]}</span>
                <button
                  onClick={() => toggleTag(tagId)}
                  className="hover:bg-purple-500/30 rounded-full p-1"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          {selectedStatus && (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center space-x-2">
              <span>{statusOptions.find(s => s.value === selectedStatus)?.label}</span>
              <button
                onClick={() => setSelectedStatus('')}
                className="hover:bg-green-500/30 rounded-full p-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {selectedLanguages.length !== 2 && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-2">
              <span>{selectedLanguages.length} idiomas</span>
              <button
                onClick={() => setSelectedLanguages(['en', 'es'])}
                className="hover:bg-blue-500/30 rounded-full p-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Resultados para &quot;{searchQuery}&quot;
            </h2>
            {!loading && (
              <span className="text-sm text-slate-400">
                {searchResults.length} resultados
              </span>
            )}
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : searchResults.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
              : 'grid-cols-1'
            }`}>
              {searchResults.map((manga) => (
                <MangaCardCompact key={manga.id} manga={manga} variant={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                No se encontraron resultados para &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial Help */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <FiSearch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Busca tu manga favorito
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Usa la barra de búsqueda o los filtros avanzados para encontrar exactamente lo que estás buscando
          </p>
        </div>
      )}
    </div>
  );
} 