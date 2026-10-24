import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  X,
  Menu,
  Sun,
  Moon,
  User as UserIcon,
  Bookmark,
  Heart,
  History,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { api } from '../../api/client.js';
import { Movie } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getMovies({ search: searchQuery, limit: 5 });
        if (res.success) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/browse?type=MOVIE' },
    { label: 'Series', path: '/browse?type=SERIES' },
    { label: 'Explore & Filters', path: '/browse' },
    { label: 'Latest Releases', path: '/browse?sort=newest' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/85 border-b border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white flex items-center">
            Cine<span className="text-brand-500">Verse</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname + location.search === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-brand-400 ${
                  isActive ? 'text-brand-500 font-semibold' : 'text-neutral-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition"
            aria-label="Search movies"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Dashboard Pill if admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/40 hover:bg-brand-500/30 transition shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* User Account / Auth Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-800 transition"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || 'User'
                    )}&background=e50914&color=fff`
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-700"
                />
                <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-brand-500 text-white">
                        Administrator
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-brand-400 hover:bg-neutral-800/80 transition"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/watchlist"
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:bg-neutral-800/80 transition"
                  >
                    <Bookmark className="w-4 h-4 text-brand-400" />
                    Watchlist
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:bg-neutral-800/80 transition"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Favorites
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:bg-neutral-800/80 transition"
                  >
                    <History className="w-4 h-4 text-blue-400" />
                    Watch History
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:bg-neutral-800/80 transition"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    Account Settings
                  </Link>

                  <div className="border-t border-neutral-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-neutral-800/80 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950/95 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-400 hover:bg-brand-500/20"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center p-3 border-b border-neutral-800">
              <Search className="w-5 h-5 text-neutral-400 ml-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, cast, director, genres, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-2 text-white placeholder-neutral-500 focus:outline-none text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-white mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-3 py-1 text-xs text-neutral-400 hover:text-white rounded-md bg-neutral-800"
              >
                ESC
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            <div className="max-h-96 overflow-y-auto p-2">
              {isSearching ? (
                <div className="p-6 text-center text-neutral-400 text-sm">Searching CineVerse catalog...</div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Top Matching Movies
                  </div>
                  {suggestions.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movie/${movie.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 transition group"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-brand-400 transition truncate">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          {movie.releaseYear} • {movie.contentType} • ⭐ {movie.externalRating || 'N/A'}
                        </p>
                        <div className="flex gap-1.5 mt-1">
                          {movie.genres.slice(0, 2).map((g) => (
                            <span key={g.slug} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-neutral-800 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium py-1"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo; →
                    </button>
                  </div>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-6 text-center text-neutral-400 text-sm">
                  No movies found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                </div>
              ) : (
                <div className="p-4 text-xs text-neutral-500 text-center">
                  Type at least 2 characters to search across titles, actors, directors, and genres.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
