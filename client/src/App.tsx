import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Layout } from './components/layout/Layout.js';
import { Home } from './pages/Home.js';
import { Browse } from './pages/Browse.js';
import { MovieDetails } from './pages/MovieDetails.js';
import { Watchlist } from './pages/Watchlist.js';
import { Favorites } from './pages/Favorites.js';
import { History } from './pages/History.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Profile } from './pages/Profile.js';
import { Legal } from './pages/Legal.js';
import { AdminLayout } from './components/admin/AdminLayout.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminMovies } from './pages/admin/AdminMovies.js';
import { Film } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-brand-500 flex items-center justify-center mb-4">
      <Film className="w-8 h-8" />
    </div>
    <h1 className="text-4xl font-black text-white mb-2">404</h1>
    <h2 className="text-xl font-bold text-neutral-300 mb-2">Scene Not Found</h2>
    <p className="text-xs text-neutral-400 max-w-sm mb-6">
      The movie, page, or stream you are seeking could not be found or has moved.
    </p>
    <div className="flex gap-3">
      <Link to="/" className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition">
        Return to Home
      </Link>
      <Link to="/browse" className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition">
        Browse All Movies
      </Link>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Pages */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="browse" element={<Browse />} />
              <Route path="movie/:slug" element={<MovieDetails />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="history" element={<History />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="legal" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
