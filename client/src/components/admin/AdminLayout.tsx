import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  ArrowLeft,
  Shield,
  Layers,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-neutral-400">
        Loading admin console...
      </div>
    );
  }

  // Route protection
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navLinks = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Manage Movies', path: '/admin/movies', icon: <Clapperboard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#0b0c10] text-[#f3f4f6]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-neutral-800/80">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Cine<span className="text-brand-500">Verse</span>
              </span>
            </Link>
            <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              Administration Panel
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-neutral-800/80 mt-4">
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to CineVerse
              </Link>
            </div>
          </nav>
        </div>

        {/* User bar & Logout */}
        <div className="p-4 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'Admin'
                )}&background=e50914&color=fff`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700"
            />
            <div className="truncate text-xs">
              <p className="font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800">
          <Link to="/" className="text-lg font-black text-white">
            Cine<span className="text-brand-500">Verse</span> Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-xs text-neutral-300 font-medium hover:text-white">
              Dashboard
            </Link>
            <Link to="/admin/movies" className="text-xs text-neutral-300 font-medium hover:text-white">
              Movies
            </Link>
            <Link to="/" className="text-xs text-brand-400 font-medium">
              Exit
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
