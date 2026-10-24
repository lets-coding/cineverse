import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Genre, Industry, Country, Language } from '../../types/index.js';
import { api } from '../../api/client.js';

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Read current query values
  const currentSearch = searchParams.get('search') || '';
  const currentGenre = searchParams.get('genre') || '';
  const currentIndustry = searchParams.get('industry') || '';
  const currentCountry = searchParams.get('country') || '';
  const currentLanguage = searchParams.get('language') || '';
  const currentType = searchParams.get('type') || '';
  const currentYear = searchParams.get('year') || '';
  const currentMinRating = searchParams.get('minRating') || '';
  const currentQuality = searchParams.get('quality') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const [localSearch, setLocalSearch] = useState(currentSearch);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  // Load taxonomy categories
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [gRes, indRes, cRes, lRes] = await Promise.all([
          api.getGenres(),
          api.getIndustries(),
          api.getCountries(),
          api.getLanguages(),
        ]);
        if (gRes.success) setGenres(gRes.data);
        if (indRes.success) setIndustries(indRes.data);
        if (cRes.success) setCountries(cRes.data);
        if (lRes.success) setLanguages(lRes.data);
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    }
    loadTaxonomy();
  }, []);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(currentSearch ||
    currentGenre ||
    currentIndustry ||
    currentCountry ||
    currentLanguage ||
    currentType ||
    currentYear ||
    currentMinRating ||
    currentQuality ||
    (currentSort && currentSort !== 'newest'));

  const years = Array.from({ length: 30 }, (_, i) => String(2026 - i));

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md shadow-xl">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title, director, cast, keywords..."
            className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition"
          >
            Search
          </button>
        </form>

        {/* Primary Dropdowns: Industry & Genre & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Industry Filter */}
          <select
            value={currentIndustry}
            onChange={(e) => updateParam('industry', e.target.value)}
            className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind.slug} value={ind.slug}>
                {ind.name}
              </option>
            ))}
          </select>

          {/* Genre Filter */}
          <select
            value={currentGenre}
            onChange={(e) => updateParam('genre', e.target.value)}
            className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="newest">Sort: Newest</option>
            <option value="popular">Sort: Most Popular</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="alpha">Sort: A to Z</option>
          </select>

          {/* More Filters Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition ${
              isExpanded || hasActiveFilters
                ? 'bg-brand-600/20 text-brand-400 border-brand-500/50'
                : 'bg-neutral-950 text-neutral-300 border-neutral-700/80 hover:bg-neutral-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Facet Filter Tray */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-in fade-in duration-200">
          {/* Content Type */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Content Type</label>
            <select
              value={currentType}
              onChange={(e) => updateParam('type', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Types</option>
              <option value="MOVIE">Movie</option>
              <option value="SERIES">TV Series</option>
              <option value="SHORT_FILM">Short Film</option>
              <option value="DOCUMENTARY">Documentary</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Country</label>
            <select
              value={currentCountry}
              onChange={(e) => updateParam('country', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Language</label>
            <select
              value={currentLanguage}
              onChange={(e) => updateParam('language', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Release Year</label>
            <select
              value={currentYear}
              onChange={(e) => updateParam('year', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Min Rating</label>
            <select
              value={currentMinRating}
              onChange={(e) => updateParam('minRating', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">Any Rating</option>
              <option value="9">⭐ 9+ Masterpiece</option>
              <option value="8">⭐ 8+ Excellent</option>
              <option value="7">⭐ 7+ Good</option>
              <option value="6">⭐ 6+ Above Average</option>
            </select>
          </div>

          {/* Video Quality */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Video Quality</label>
            <select
              value={currentQuality}
              onChange={(e) => updateParam('quality', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Qualities</option>
              <option value="4K">4K Ultra HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
