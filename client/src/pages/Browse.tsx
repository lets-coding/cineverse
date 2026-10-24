import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { FilterBar } from '../components/movie/FilterBar.js';
import { MovieCard } from '../components/movie/MovieCard.js';
import { Movie } from '../types/index.js';
import { api } from '../api/client.js';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    async function fetchFilteredMovies() {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 18,
          search: searchParams.get('search') || undefined,
          genre: searchParams.get('genre') || undefined,
          industry: searchParams.get('industry') || undefined,
          country: searchParams.get('country') || undefined,
          language: searchParams.get('language') || undefined,
          year: searchParams.get('year') || undefined,
          minRating: searchParams.get('minRating') || undefined,
          quality: searchParams.get('quality') || undefined,
          type: searchParams.get('type') || undefined,
          sort: searchParams.get('sort') || 'newest',
        };

        const res = await api.getMovies(params);
        if (res.success) {
          setMovies(res.data);
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilteredMovies();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-7 h-7 text-brand-500" />
            Explore Catalog
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Discover authorized films, series, and short films across global industries.
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          Showing <span className="font-bold text-white">{movies.length}</span> of{' '}
          <span className="font-bold text-white">{total}</span> titles
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <FilterBar />

      {/* Results Grid / Loading / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col space-y-3">
              <div className="aspect-[2/3] bg-neutral-900 rounded-xl" />
              <div className="h-4 bg-neutral-900 rounded w-3/4" />
              <div className="h-3 bg-neutral-900 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-neutral-500 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No movies match your criteria</h3>
          <p className="text-sm text-neutral-400 max-w-sm mb-6">
            Try adjusting your search terms, changing the genre, or clearing the selected filters.
          </p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 rounded-lg text-xs font-semibold transition ${
                page === currentPage
                  ? 'bg-brand-600 text-white font-bold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
