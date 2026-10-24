import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Eye,
  Download,
  Users,
  Layers,
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DashboardStats } from '../../types/index.js';
import { api } from '../../api/client.js';
import { MovieFormModal } from '../../components/admin/MovieFormModal.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Operations Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time platform metrics, streaming activity, and catalog operations.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Titles</span>
            <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats?.totalMovies ?? '-'}</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            <span className="text-emerald-400 font-semibold">{stats?.publishedMovies ?? 0}</span> published •{' '}
            <span className="text-amber-400 font-semibold">{stats?.draftMovies ?? 0}</span> drafts
          </p>
        </div>

        {/* Total Streams */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Streams / Views</span>
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats?.totalViews ?? '-'}</p>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Total playback sessions recorded
          </p>
        </div>

        {/* Authorized Downloads */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Downloads</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats?.totalDownloads ?? '-'}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Verified authorized media files</p>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats?.totalUsers ?? '-'}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Across user & administrator roles</p>
        </div>
      </div>

      {/* Two Column Layout: Recently Added & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added Movies */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Recently Added Titles
            </h3>
            <Link to="/admin/movies" className="text-xs text-brand-400 hover:text-brand-300">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentMovies && stats.recentMovies.length > 0 ? (
              stats.recentMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded shadow-sm"
                    />
                    <div>
                      <h4 className="font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                        {movie.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400">Year: {movie.releaseYear}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        movie.isPublished
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {movie.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {movie.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic py-4 text-center">No movies registered yet.</p>
            )}
          </div>
        </div>

        {/* Administrative Activity Log */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Audit Log
            </h3>
            <span className="text-xs text-neutral-500">Security & Catalog Events</span>
          </div>

          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-brand-400 font-bold uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-xs truncate">{log.details || log.entityType}</p>
                  <p className="text-[10px] text-neutral-500">By: {log.admin?.name || 'System'}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic py-4 text-center">No recent audit logs recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Movie Modal */}
      <MovieFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadStats}
      />
    </div>
  );
};
