import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Download,
  Star,
  Plus,
  Check,
  Heart,
  Share2,
  Clock,
  Calendar,
  Globe,
  Film,
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { VideoPlayer } from '../components/player/VideoPlayer.js';
import { DownloadModal } from '../components/movie/DownloadModal.js';
import { MovieCard } from '../components/movie/MovieCard.js';
import { MovieDetail } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';

export const MovieDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const playerSectionRef = useRef<HTMLDivElement>(null);

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(9);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getMovieBySlug(slug);
        if (res.success) {
          setMovie(res.data);
          setInWatchlist(res.data.isInWatchlist);
          setIsFavorite(res.data.isFavorite);
          // Increment views count asynchronously
          api.recordView(res.data.id).catch(() => {});
        } else {
          setError('Movie not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load movie');
      } finally {
        setIsLoading(false);
      }
    }
    loadMovie();
  }, [slug]);

  const scrollToPlayer = () => {
    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated || !movie) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.toggleWatchlist(movie.id);
      if (res.success) setInWatchlist(res.isInWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !movie) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.toggleFavorite(movie.id);
      if (res.success) setIsFavorite(res.isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProgressUpdate = (progressSeconds: number, durationSeconds: number) => {
    if (isAuthenticated && movie) {
      api.saveProgress(movie.id, progressSeconds, durationSeconds).catch(() => {});
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !movie || !userComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.addReview(movie.id, userRating, userComment.trim());
      if (res.success) {
        setMovie((prev) =>
          prev
            ? {
                ...prev,
                reviews: [res.data, ...prev.reviews.filter((r) => r.userId !== user?.id)],
              }
            : null
        );
        setUserComment('');
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400">
        <div className="animate-pulse space-y-4 text-center">
          <Film className="w-10 h-10 text-brand-500 mx-auto animate-bounce" />
          <p className="text-sm">Loading CineVerse movie presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Movie Presentation Unavailable</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{error || 'This title is not currently available.'}</p>
        <Link to="/browse" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const director = movie.credits?.find((c) => c.role === 'DIRECTOR')?.person?.name;
  const castList = movie.credits?.filter((c) => c.role === 'ACTOR');

  return (
    <div className="min-h-screen pb-16">
      {/* Backdrop Header */}
      <div className="relative w-full h-[55vh] min-h-[400px] overflow-hidden bg-neutral-950">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent w-full md:w-2/3" />
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster & Actions */}
          <div className="w-56 sm:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-neutral-900 aspect-[2/3] relative">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <button
                onClick={scrollToPlayer}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/30 transition text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch Online
              </button>

              {movie.downloadEnabled ? (
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:text-white transition text-xs font-semibold"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download Authorized File
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-500 text-center">
                  Downloads disabled by publisher
                </div>
              )}

              {/* Watchlist & Favorites Toolbar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition ${
                    inWatchlist
                      ? 'bg-brand-600/20 text-brand-400 border-brand-500/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                  title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {inWatchlist ? 'Saved' : 'Watchlist'}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                  title={isFavorite ? 'Favorited' : 'Favorite'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                  Favorite
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition"
                  title="Share Movie Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {copiedLink && (
                <p className="text-[11px] text-center text-emerald-400 animate-in fade-in">
                  Link copied to clipboard!
                </p>
              )}
            </div>
          </div>

          {/* Details & Information */}
          <div className="flex-1 space-y-5">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase tracking-wider text-[10px]">
                {movie.contentType.replace('_', ' ')}
              </span>

              {movie.externalRating && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900 text-amber-400 border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.externalRating.toFixed(1)} {movie.ratingSource}
                </span>
              )}

              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {movie.releaseYear}
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                {movie.ageRating}
              </span>

              {movie.runtime > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {movie.runtime} min
                </span>
              )}
            </div>

            {/* Title & Original Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-base text-neutral-400 italic mt-1">
                  Original Title: {movie.originalTitle}
                </p>
              )}
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g) => (
                <Link
                  key={g.slug}
                  to={`/browse?genre=${g.slug}`}
                  className="text-xs px-3 py-1 rounded-full bg-neutral-800/80 hover:bg-brand-600/30 text-neutral-200 hover:text-white border border-neutral-700/60 transition"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Synopsis</h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {movie.synopsis || movie.description}
              </p>
            </div>

            {/* Taxonomy & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              {director && (
                <div>
                  <span className="text-neutral-400 block mb-0.5">Director</span>
                  <span className="font-semibold text-white">{director}</span>
                </div>
              )}

              {movie.industries && movie.industries.length > 0 && (
                <div>
                  <span className="text-neutral-400 block mb-0.5">Film Industry</span>
                  <div className="flex flex-wrap gap-1">
                    {movie.industries.map((ind) => (
                      <Link
                        key={ind.slug}
                        to={`/browse?industry=${ind.slug}`}
                        className="text-brand-400 hover:underline"
                      >
                        {ind.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {movie.countries && movie.countries.length > 0 && (
                <div>
                  <span className="text-neutral-400 block mb-0.5">Country</span>
                  <span className="text-neutral-200">
                    {movie.countries.map((c) => c.name).join(', ')}
                  </span>
                </div>
              )}

              {movie.languages && movie.languages.length > 0 && (
                <div>
                  <span className="text-neutral-400 block mb-0.5">Languages & Audio</span>
                  <span className="text-neutral-200">
                    {movie.languages.map((l) => l.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Cast List */}
            {castList && castList.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Cast & Characters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {castList.map((c) => (
                    <div
                      key={c.id}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                      <div>
                        <span className="font-semibold text-white">{c.person.name}</span>
                        {c.characterName && (
                          <span className="text-neutral-400 ml-1">as {c.characterName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Streaming Player Section */}
        <div ref={playerSectionRef} className="mt-14 pt-8 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-brand-500 fill-brand-500" />
                Watch Online (HD Streaming)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Adaptive bitrate streaming with HTML5 & HLS.js. Automatic quality switching enabled.
              </p>
            </div>
            {movie.userProgress > 0 && (
              <span className="text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                Resume from {Math.floor(movie.userProgress / 60)}m
              </span>
            )}
          </div>

          <VideoPlayer
            sources={movie.videoSources}
            subtitles={movie.subtitleTracks}
            title={movie.title}
            poster={movie.backdropUrl}
            initialProgress={movie.userProgress}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>

        {/* User Reviews & Ratings Section */}
        <div className="mt-14 pt-8 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              Community Reviews & Ratings ({movie.reviews?.length || 0})
            </h2>
          </div>

          {/* Add Review Form */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 mb-8 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Leave your review</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">Your Rating:</span>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(parseInt(e.target.value, 10))}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  {Array.from({ length: 10 }, (_, i) => 10 - i).map((score) => (
                    <option key={score} value={score}>
                      ⭐ {score} / 10
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your thoughts about this movie's plot, cinematography, performance, and streaming experience..."
                rows={3}
                required
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />

              <button
                type="submit"
                disabled={isSubmittingReview || !userComment.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {isSubmittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 text-center mb-8">
              <Link to="/login" className="text-brand-400 font-semibold hover:underline">
                Sign in
              </Link>{' '}
              to leave a review and rate this movie.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            {movie.reviews && movie.reviews.length > 0 ? (
              movie.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          rev.user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            rev.user.name
                          )}&background=262a36&color=fff`
                        }
                        alt={rev.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-xs text-white">{rev.user.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {rev.rating}/10
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Recommendations / More Like This */}
        {movie.recommendations && movie.recommendations.length > 0 && (
          <div className="mt-14 pt-8 border-t border-neutral-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {movie.recommendations.map((rec) => (
                <MovieCard key={rec.id} movie={rec} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        movieId={movie.id}
        movieTitle={movie.title}
        downloadEnabled={movie.downloadEnabled}
        downloadSources={movie.downloadSources}
      />
    </div>
  );
};
