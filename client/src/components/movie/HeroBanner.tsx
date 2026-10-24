import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
import { Movie } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';

interface HeroBannerProps {
  movie: Movie | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  const { isAuthenticated } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

  if (!movie) {
    return (
      <div className="relative w-full h-[60vh] min-h-[420px] bg-neutral-900 animate-pulse flex items-center justify-center text-neutral-600">
        Loading featured cinema...
      </div>
    );
  }

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsLoadingWatchlist(true);
    try {
      const res = await api.toggleWatchlist(movie.id);
      if (res.success) {
        setInWatchlist(res.isInWatchlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden bg-neutral-950">
      {/* Backdrop Image */}
      <img
        src={movie.backdropUrl || movie.posterUrl}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 scale-105 animate-in fade-in duration-700"
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent w-full md:w-3/4" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-brand-600 text-white font-bold tracking-wider uppercase text-[10px]">
              Featured Cinema
            </span>
            {movie.externalRating && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-amber-400 border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {movie.externalRating.toFixed(1)} {movie.ratingSource || 'IMDb'}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-neutral-300 border border-neutral-700/50">
              {movie.releaseYear}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-neutral-300 border border-neutral-700/50">
              {movie.ageRating}
            </span>
            {movie.runtime > 0 && (
              <span className="px-2 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-neutral-300 border border-neutral-700/50">
                {movie.runtime} min
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Original Title if differs */}
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-sm font-medium text-neutral-300 italic -mt-2">
              Original: {movie.originalTitle}
            </p>
          )}

          {/* Genres Pills */}
          <div className="flex flex-wrap gap-1.5">
            {movie.genres?.map((g) => (
              <span
                key={g.slug}
                className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800/80 backdrop-blur-sm text-neutral-200 border border-neutral-700/50"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed drop-shadow">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/movie/${movie.slug}#player`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/40 hover:scale-105 transition-all text-sm sm:text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>

            <Link
              to={`/movie/${movie.slug}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 font-medium backdrop-blur-md border border-neutral-700 hover:text-white transition text-sm sm:text-base"
            >
              <Info className="w-4 h-4" />
              Details
            </Link>

            <button
              onClick={handleToggleWatchlist}
              disabled={isLoadingWatchlist}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all ${
                inWatchlist
                  ? 'bg-brand-600/20 text-brand-400 border-brand-500/40'
                  : 'bg-neutral-900/70 text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
              title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-5 h-5 text-brand-400" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
