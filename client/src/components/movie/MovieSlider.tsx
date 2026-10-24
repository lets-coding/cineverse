import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../../types/index.js';
import { MovieCard } from './MovieCard.js';

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  seeAllLink?: string;
  icon?: React.ReactNode;
}

export const MovieSlider: React.FC<MovieSliderProps> = ({
  title,
  movies,
  seeAllLink,
  icon,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="my-8 relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {icon && <span className="text-brand-500">{icon}</span>}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="text-xs sm:text-sm font-medium text-brand-400 hover:text-brand-300 transition"
          >
            See All →
          </Link>
        )}
      </div>

      {/* Slider Controls */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-950/80 backdrop-blur-md text-white border border-neutral-700/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-600 hover:border-brand-500 shadow-xl"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-950/80 backdrop-blur-md text-white border border-neutral-700/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-600 hover:border-brand-500 shadow-xl"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Movies Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-4 scroll-smooth"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="w-[160px] sm:w-[190px] md:w-[210px] flex-shrink-0">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
};
