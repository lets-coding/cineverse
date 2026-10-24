import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Film } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard.js';
import { Movie } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export const Favorites: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getFavorites();
        if (res.success) {
          setMovies(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to view Favorites</h2>
        <p className="text-sm text-neutral-400 mb-6">Save the films that touched your heart.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Favorite Movies</h1>
          <p className="text-xs text-neutral-400">{movies.length} titles in your collection</p>
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
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No favorites saved yet</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Click the Favorite button on any movie page to keep it in your personal collection.
          </p>
          <Link to="/browse" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs">
            Explore Movies
          </Link>
        </div>
      )}
    </div>
  );
};
