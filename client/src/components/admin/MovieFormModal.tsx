import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Film, CheckCircle2, AlertCircle } from 'lucide-react';
import { Genre, Industry, Country, Language } from '../../types/index.js';
import { api } from '../../api/client.js';

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMovie?: any | null;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMovie,
}) => {
  const isEdit = !!initialMovie;

  // Taxonomy states
  const [genres, setGenres] = useState<Genre[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [releaseDate, setReleaseDate] = useState('');
  const [contentType, setContentType] = useState('MOVIE');
  const [runtime, setRuntime] = useState(120);
  const [ageRating, setAgeRating] = useState('PG-13');
  const [externalRating, setExternalRating] = useState<number | ''>(8.0);
  const [ratingSource, setRatingSource] = useState('IMDb');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Selected taxonomies
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);

  // Credits
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState<{ name: string; characterName: string }[]>([
    { name: '', characterName: '' },
  ]);

  // Video sources
  const [videoSources, setVideoSources] = useState<
    { format: string; streamUrl: string; qualityLabel: string; isPrimary: boolean }[]
  >([
    {
      format: 'hls',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      qualityLabel: 'Auto (HLS Multi-Bitrate)',
      isPrimary: true,
    },
  ]);

  // Subtitle tracks
  const [subtitleTracks, setSubtitleTracks] = useState<
    { language: string; label: string; vttUrl: string; isDefault: boolean }[]
  >([]);

  // Download sources
  const [downloadSources, setDownloadSources] = useState<
    { qualityLabel: string; resolution: string; fileSize: string; format: string; downloadUrl: string }[]
  >([
    {
      qualityLabel: '1080p Full HD',
      resolution: '1920x1080',
      fileSize: '1.5 GB',
      format: 'mp4',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load taxonomy categories on mount
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [gRes, indRes, cRes, lRes] = await Promise.all([
          api.getGenres(),
          api.getIndustries(),
          api.getCountries(),
          api.getLanguages(),
        ]);
        if (gRes.success) setGenres(gRes.data);
        if (indRes.success) setIndustries(indRes.data);
        if (cRes.success) setCountries(cRes.data);
        if (lRes.success) setLanguages(lRes.data);
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    }
    loadTaxonomy();
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (initialMovie) {
      setTitle(initialMovie.title || '');
      setOriginalTitle(initialMovie.originalTitle || '');
      setSlug(initialMovie.slug || '');
      setDescription(initialMovie.description || '');
      setSynopsis(initialMovie.synopsis || initialMovie.description || '');
      setReleaseYear(initialMovie.releaseYear || new Date().getFullYear());
      setReleaseDate(initialMovie.releaseDate || '');
      setContentType(initialMovie.contentType || 'MOVIE');
      setRuntime(initialMovie.runtime || 120);
      setAgeRating(initialMovie.ageRating || 'PG-13');
      setExternalRating(initialMovie.externalRating ?? '');
      setRatingSource(initialMovie.ratingSource || 'IMDb');
      setPosterUrl(initialMovie.posterUrl || '');
      setBackdropUrl(initialMovie.backdropUrl || '');
      setTrailerUrl(initialMovie.trailerUrl || '');
      setSearchKeywords(initialMovie.searchKeywords || '');
      setIsFeatured(!!initialMovie.isFeatured);
      setIsPublished(initialMovie.isPublished !== undefined ? initialMovie.isPublished : true);
      setDownloadEnabled(initialMovie.downloadEnabled !== undefined ? initialMovie.downloadEnabled : true);
      setSeoTitle(initialMovie.seoTitle || '');
      setSeoDescription(initialMovie.seoDescription || '');
    } else {
      // Default clean values
      setTitle('');
      setOriginalTitle('');
      setSlug('');
      setDescription('');
      setSynopsis('');
      setReleaseYear(new Date().getFullYear());
      setPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600');
      setBackdropUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600');
    }
  }, [initialMovie]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleCastChange = (index: number, field: 'name' | 'characterName', val: string) => {
    const updated = [...cast];
    updated[index][field] = val;
    setCast(updated);
  };

  const addCastMember = () => {
    setCast([...cast, { name: '', characterName: '' }]);
  };

  const removeCastMember = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const addVideoSource = () => {
    setVideoSources([
      ...videoSources,
      { format: 'mp4', streamUrl: '', qualityLabel: '1080p MP4', isPrimary: false },
    ]);
  };

  const removeVideoSource = (index: number) => {
    setVideoSources(videoSources.filter((_, i) => i !== index));
  };

  const addSubtitle = () => {
    setSubtitleTracks([
      ...subtitleTracks,
      { language: 'en', label: 'English', vttUrl: '', isDefault: false },
    ]);
  };

  const removeSubtitle = (index: number) => {
    setSubtitleTracks(subtitleTracks.filter((_, i) => i !== index));
  };

  const addDownloadSource = () => {
    setDownloadSources([
      ...downloadSources,
      { qualityLabel: '720p HD', resolution: '1280x720', fileSize: '750 MB', format: 'mp4', downloadUrl: '' },
    ]);
  };

  const removeDownloadSource = (index: number) => {
    setDownloadSources(downloadSources.filter((_, i) => i !== index));
  };

  const toggleTaxonomy = (id: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        originalTitle: originalTitle || null,
        slug,
        description,
        synopsis: synopsis || description,
        releaseYear: Number(releaseYear),
        releaseDate: releaseDate || null,
        contentType,
        runtime: Number(runtime),
        ageRating,
        externalRating: externalRating !== '' ? Number(externalRating) : null,
        ratingSource: ratingSource || 'IMDb',
        posterUrl,
        backdropUrl,
        trailerUrl: trailerUrl || null,
        searchKeywords: searchKeywords || null,
        isFeatured,
        isPublished,
        downloadEnabled,
        seoTitle: seoTitle || `${title} - Watch on CineVerse`,
        seoDescription: seoDescription || description,
        genreIds: selectedGenreIds,
        industryIds: selectedIndustryIds,
        countryIds: selectedCountryIds,
        languageIds: selectedLanguageIds,
        director: director || null,
        cast: cast.filter((c) => c.name.trim() !== ''),
        videoSources: videoSources.filter((v) => v.streamUrl.trim() !== ''),
        subtitleTracks: subtitleTracks.filter((s) => s.vttUrl.trim() !== ''),
        downloadSources: downloadEnabled
          ? downloadSources.filter((d) => d.downloadUrl.trim() !== '')
          : [],
      };

      if (isEdit) {
        await api.updateMovie(initialMovie.id, payload);
      } else {
        await api.createMovie(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? `Edit: ${initialMovie.title}` : 'Add New Movie to CineVerse'}
              </h2>
              <p className="text-xs text-neutral-400">
                Changes will immediately appear in public catalogs and search indexes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1 text-xs">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              1. Title & Core Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Tears of Steel"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Original Title</label>
                <input
                  type="text"
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder="Original language title"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="tears-of-steel"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Release Year *</label>
                <input
                  type="number"
                  required
                  min={1888}
                  max={2100}
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(parseInt(e.target.value, 10))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="MOVIE">Movie</option>
                  <option value="SERIES">TV Series</option>
                  <option value="SHORT_FILM">Short Film</option>
                  <option value="DOCUMENTARY">Documentary</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Runtime (min) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={runtime}
                  onChange={(e) => setRuntime(parseInt(e.target.value, 10))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Age Rating</label>
                <select
                  value={ageRating}
                  onChange={(e) => setAgeRating(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="G">G - General</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R - Restricted</option>
                  <option value="NC-17">NC-17</option>
                  <option value="TV-MA">TV-MA</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Rating (IMDb)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={externalRating}
                  onChange={(e) => setExternalRating(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="8.5"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Short Description *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief one or two line teaser summary..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Full Synopsis</label>
              <textarea
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Comprehensive cinematic plot outline..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Section 2: Media Assets */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              2. Posters & Artwork
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Poster Image URL *</label>
                <input
                  type="url"
                  required
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Backdrop Image URL *</label>
                <input
                  type="url"
                  required
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Taxonomy & Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              3. Categories & Cinema Tagging
            </h3>

            {/* Genres */}
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">Genres</label>
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggleTaxonomy(g.id, selectedGenreIds, setSelectedGenreIds)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      selectedGenreIds.includes(g.id)
                        ? 'bg-brand-600 text-white'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">Film Industry</label>
              <div className="flex flex-wrap gap-1.5">
                {industries.map((ind) => (
                  <button
                    type="button"
                    key={ind.id}
                    onClick={() => toggleTaxonomy(ind.id, selectedIndustryIds, setSelectedIndustryIds)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      selectedIndustryIds.includes(ind.id)
                        ? 'bg-brand-600 text-white'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {ind.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="e.g. Christopher Nolan"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Search Keywords</label>
                <input
                  type="text"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="sci-fi, time travel, ai, space"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Cast Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-medium text-neutral-300">Cast Members</label>
                <button
                  type="button"
                  onClick={addCastMember}
                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Cast
                </button>
              </div>
              <div className="space-y-2">
                {cast.map((c, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Actor Name"
                      value={c.name}
                      onChange={(e) => handleCastChange(idx, 'name', e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Character Name (optional)"
                      value={c.characterName}
                      onChange={(e) => handleCastChange(idx, 'characterName', e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                    />
                    {cast.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCastMember(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Video Streaming & HLS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Video Streaming Sources (HLS / MP4)
              </h3>
              <button
                type="button"
                onClick={addVideoSource}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Source
              </button>
            </div>

            <div className="space-y-3">
              {videoSources.map((vs, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={vs.format}
                      onChange={(e) => {
                        const updated = [...videoSources];
                        updated[idx].format = e.target.value;
                        setVideoSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white w-24"
                    >
                      <option value="hls">HLS (.m3u8)</option>
                      <option value="mp4">MP4 (.mp4)</option>
                    </select>

                    <input
                      type="url"
                      required
                      placeholder="Stream URL (e.g. https://.../playlist.m3u8)"
                      value={vs.streamUrl}
                      onChange={(e) => {
                        const updated = [...videoSources];
                        updated[idx].streamUrl = e.target.value;
                        setVideoSources(updated);
                      }}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white font-mono"
                    />

                    <input
                      type="text"
                      placeholder="Quality label"
                      value={vs.qualityLabel}
                      onChange={(e) => {
                        const updated = [...videoSources];
                        updated[idx].qualityLabel = e.target.value;
                        setVideoSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white w-32"
                    />

                    {videoSources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoSource(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Authorized Downloads */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  5. Authorized Downloads
                </h3>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={downloadEnabled}
                    onChange={(e) => setDownloadEnabled(e.target.checked)}
                    className="accent-brand-500 rounded"
                  />
                  <span>Downloads Authorized</span>
                </label>
              </div>

              {downloadEnabled && (
                <button
                  type="button"
                  onClick={addDownloadSource}
                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Download File
                </button>
              )}
            </div>

            {downloadEnabled && (
              <div className="space-y-3">
                {downloadSources.map((ds, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label (e.g. 1080p Full HD)"
                      value={ds.qualityLabel}
                      onChange={(e) => {
                        const updated = [...downloadSources];
                        updated[idx].qualityLabel = e.target.value;
                        setDownloadSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                    />

                    <input
                      type="text"
                      placeholder="Resolution (e.g. 1920x1080)"
                      value={ds.resolution}
                      onChange={(e) => {
                        const updated = [...downloadSources];
                        updated[idx].resolution = e.target.value;
                        setDownloadSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                    />

                    <input
                      type="text"
                      placeholder="File Size (e.g. 1.8 GB)"
                      value={ds.fileSize}
                      onChange={(e) => {
                        const updated = [...downloadSources];
                        updated[idx].fileSize = e.target.value;
                        setDownloadSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                    />

                    <input
                      type="url"
                      placeholder="Download URL"
                      value={ds.downloadUrl}
                      onChange={(e) => {
                        const updated = [...downloadSources];
                        updated[idx].downloadUrl = e.target.value;
                        setDownloadSources(updated);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white font-mono"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDownloadSource(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Publishing Controls */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-white">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span>Published (Visible on site)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-white">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span>Feature on Home Hero Banner</span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Database...' : isEdit ? 'Update Movie' : 'Publish Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
