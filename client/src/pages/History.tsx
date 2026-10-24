import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Play, Film } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export const History: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getWatchHistory();
        if (res.success) {
          setHistoryItems(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <HistoryIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to view Watch History</h2>
        <p className="text-sm text-neutral-400 mb-6">Resume your movies and series from right where you left off.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Continue Watching</h1>
          <p className="text-xs text-neutral-400">{historyItems.length} titles in your history</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video bg-neutral-900 rounded-xl" />
          ))}
        </div>
      ) : historyItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-brand-500/50 transition flex flex-col"
            >
              <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                <img
                  src={item.movie.backdropUrl || item.movie.posterUrl}
                  alt={item.movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/movie/${item.movie.slug}#player`}
                    className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-white" />
                  </Link>
                </div>

                {/* Progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-neutral-800">
                  <div
                    className="h-full bg-brand-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  />
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-brand-400 truncate">
                    {item.movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                    <span>
                      {Math.floor(item.progressSeconds / 60)}m of {Math.floor(item.durationSeconds / 60)}m
                    </span>
                    <span>{item.percentage}%</span>
                  </div>
                </div>

                <Link
                  to={`/movie/${item.movie.slug}#player`}
                  className="mt-3 block text-center py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-brand-600 hover:text-white transition"
                >
                  Resume
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No watch history yet</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Start streaming movies and your playback progress will automatically appear here.
          </p>
          <Link to="/browse" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs">
            Start Watching
          </Link>
        </div>
      )}
    </div>
  );
};
