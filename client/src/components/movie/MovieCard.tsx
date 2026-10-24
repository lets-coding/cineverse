import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Plus, Check } from 'lucide-react';
import { Movie } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';

interface MovieCardProps {
  movie: Movie;
  onWatchlistChange?: (id: string, inWatchlist: boolean) => void;
  isInWatchlistInitially?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onWatchlistChange,
  isInWatchlistInitially = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlistInitially);
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setIsUpdatingWatchlist(true);
    try {
      const res = await api.toggleWatchlist(movie.id);
      if (res.success) {
        setInWatchlist(res.isInWatchlist);
        if (onWatchlistChange) {
          onWatchlistChange(movie.id, res.isInWatchlist);
        }
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const primaryQuality = movie.availableQualities?.[0] || 'HD';

  return (
    <div className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80 hover:border-brand-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col">
      <Link to={`/movie/${movie.slug}`} className="block relative aspect-[2/3] overflow-hidden bg-neutral-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          {movie.externalRating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-400/20 shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {movie.externalRating.toFixed(1)}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-950/80 backdrop-blur-md text-neutral-300 border border-neutral-700/50">
            {primaryQuality}
          </span>
        </div>

        {/* Quick Add to Watchlist Button */}
        <button
          onClick={handleToggleWatchlist}
          disabled={isUpdatingWatchlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full z-10 backdrop-blur-md transition-all shadow-md ${
            inWatchlist
              ? 'bg-brand-600 text-white'
              : 'bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-brand-600'
          }`}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Hover Overlay Play Icon */}
        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-brand-600/50">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </div>
        </div>

        {/* Subtle Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
      </Link>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/movie/${movie.slug}`}
            className="block text-sm font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span className="capitalize">{movie.contentType.toLowerCase().replace('_', ' ')}</span>
            {movie.runtime > 0 && (
              <>
                <span>•</span>
                <span>{movie.runtime}m</span>
              </>
            )}
          </div>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {movie.genres?.slice(0, 2).map((g) => (
            <span
              key={g.slug}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/40"
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
