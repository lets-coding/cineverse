import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard.js';
import { Movie } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export const Watchlist: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getWatchlist();
        if (res.success) {
          setMovies(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Bookmark className="w-12 h-12 text-brand-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your Watchlist</h2>
        <p className="text-sm text-neutral-400 mb-6">Keep track of all the movies and series you want to watch later.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Watchlist</h1>
          <p className="text-xs text-neutral-400">{movies.length} titles saved</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-900 rounded-xl" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlistInitially={true}
              onWatchlistChange={(id, inWl) => {
                if (!inWl) setMovies((prev) => prev.filter((m) => m.id !== id));
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is empty</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Click the plus (+) icon on any movie poster to add it to your watchlist.
          </p>
          <Link to="/browse" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs">
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};
