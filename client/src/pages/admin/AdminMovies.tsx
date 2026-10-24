import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { MovieFormModal } from '../../components/admin/MovieFormModal.js';

export const AdminMovies: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<any | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMovies(page, search, status);
      if (res.success) {
        setMovies(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.togglePublish(id);
      if (res.success) {
        setMovies((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isPublished: res.data.isPublished } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await api.toggleFeatured(id);
      if (res.success) {
        setMovies((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isFeatured: res.data.isFeatured } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingMovie) return;
    try {
      const res = await api.deleteMovie(deletingMovie.id);
      if (res.success) {
        setMovies((prev) => prev.filter((m) => m.id !== deletingMovie.id));
        setDeletingMovie(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedIds.length} movies?`)) {
      return;
    }
    try {
      const res = await api.bulkActions(action, selectedIds);
      if (res.success) {
        setSelectedIds([]);
        fetchMovies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === movies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(movies.map((m) => m.id));
    }
  };

  const toggleSelectMovie = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/admin/movies/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Movie Management</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your streaming catalog, video sources, download links, and publication states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Buttons */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-300 font-medium transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            CSV Export
          </button>

          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-300 font-medium transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            JSON Export
          </button>

          <button
            onClick={() => {
              setEditingMovie(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Add Movie
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-20 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg"
          >
            Filter
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs animate-in fade-in">
          <span className="font-semibold text-brand-400">
            {selectedIds.length} movie(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="px-3 py-1 rounded-lg bg-neutral-900 text-emerald-400 hover:bg-emerald-500/20 font-medium"
            >
              Bulk Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="px-3 py-1 rounded-lg bg-neutral-900 text-amber-400 hover:bg-amber-500/20 font-medium"
            >
              Bulk Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 rounded-lg bg-neutral-900 text-red-400 hover:bg-red-500/20 font-medium"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* Movies Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={movies.length > 0 && selectedIds.length === movies.length}
                    onChange={toggleSelectAll}
                    className="accent-brand-500 rounded"
                  />
                </th>
                <th className="p-4">Movie</th>
                <th className="p-4">Category / Industry</th>
                <th className="p-4">Sources</th>
                <th className="p-4">Downloads</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    Loading movies...
                  </td>
                </tr>
              ) : movies.length > 0 ? (
                movies.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-800/50 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelectMovie(m.id)}
                        className="accent-brand-500 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-9 h-12 object-cover rounded shadow"
                        />
                        <div className="max-w-[200px] truncate">
                          <span className="font-bold text-white block truncate">{m.title}</span>
                          <span className="text-[11px] text-neutral-400">
                            {m.releaseYear} • {m.contentType} • ⭐ {m.externalRating || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-300">
                      <p className="truncate max-w-[150px]">{m.genres?.join(', ') || 'None'}</p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                        {m.industries?.join(', ')}
                      </p>
                    </td>
                    <td className="p-4 text-neutral-400">
                      <span>{m._count?.videoSources || 0} stream(s)</span>
                    </td>
                    <td className="p-4">
                      {m.downloadEnabled ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Enabled
                        </span>
                      ) : (
                        <span className="text-neutral-500 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(m.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                            m.isPublished
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {m.isPublished ? 'Published' : 'Draft'}
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(m.id)}
                          title="Toggle Hero Feature"
                          className={`p-1 rounded transition ${
                            m.isFeatured ? 'text-brand-500' : 'text-neutral-600 hover:text-neutral-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${m.isFeatured ? 'fill-brand-500' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/movie/${m.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setEditingMovie(m);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-brand-400 rounded hover:bg-neutral-800 transition"
                          title="Edit movie"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMovie(m)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition"
                          title="Delete movie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No movies found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing page {page} of {totalPages} ({total} movies total)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <MovieFormModal
        isOpen={isModalOpen}
        initialMovie={editingMovie}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMovie(null);
        }}
        onSuccess={fetchMovies}
      />

      {/* Delete Confirmation Modal */}
      {deletingMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Delete Movie?</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Are you sure you want to permanently delete &ldquo;{deletingMovie.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingMovie(null)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
