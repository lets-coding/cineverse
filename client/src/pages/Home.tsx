import React, { useState, useEffect } from 'react';
import { Flame, Star, Award, Clock, Sparkles } from 'lucide-react';
import { HeroBanner } from '../components/movie/HeroBanner.js';
import { MovieSlider } from '../components/movie/MovieSlider.js';
import { Movie } from '../types/index.js';
import { api } from '../api/client.js';

export const Home: React.FC = () => {
  const [hero, setHero] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getHomeSections();
        if (res.success) {
          setHero(res.data.hero);
          setTrending(res.data.trending);
          setPopular(res.data.popular);
          setTopRated(res.data.topRated);
          setRecentlyAdded(res.data.recentlyAdded);
        }
      } catch (err) {
        console.error('Failed to load home sections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner movie={hero} />

      {/* Main Movie Sliders */}
      <div className="max-w-7xl mx-auto -mt-10 sm:-mt-14 relative z-20 space-y-6">
        <MovieSlider
          title="Trending Now"
          movies={trending}
          seeAllLink="/browse?sort=popular"
          icon={<Flame className="w-6 h-6 text-orange-500" />}
        />

        <MovieSlider
          title="Popular Movies"
          movies={popular}
          seeAllLink="/browse?sort=popular"
          icon={<Star className="w-6 h-6 text-amber-400" />}
        />

        <MovieSlider
          title="Top Rated Masterpieces"
          movies={topRated}
          seeAllLink="/browse?sort=rating"
          icon={<Award className="w-6 h-6 text-brand-500" />}
        />

        <MovieSlider
          title="Recently Added Releases"
          movies={recentlyAdded}
          seeAllLink="/browse?sort=newest"
          icon={<Clock className="w-6 h-6 text-blue-400" />}
        />
      </div>
    </div>
  );
};
