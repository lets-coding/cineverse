import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Mail, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white font-bold">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Cine<span className="text-brand-500">Verse</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed">
              CineVerse is a modern, high-definition movie streaming and discovery platform. Explore curated
              cinematic masterpieces across Hollywood, Bollywood, South Indian, Korean, Japanese, and international
              cinema with adaptive HLS playback.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Authorized Streaming & Fast Downloads
            </div>
          </div>

          {/* Discover Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Discover</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-brand-400 transition">All Movies & Series</Link>
              </li>
              <li>
                <Link to="/browse?sort=popular" className="hover:text-brand-400 transition">Trending Now</Link>
              </li>
              <li>
                <Link to="/browse?sort=rating" className="hover:text-brand-400 transition">Top Rated</Link>
              </li>
              <li>
                <Link to="/browse?type=SERIES" className="hover:text-brand-400 transition">TV Series</Link>
              </li>
              <li>
                <Link to="/browse?type=SHORT_FILM" className="hover:text-brand-400 transition">Short Films</Link>
              </li>
            </ul>
          </div>

          {/* Regional Cinema */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Cinemas & Industries</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse?industry=hollywood" className="hover:text-brand-400 transition">Hollywood</Link>
              </li>
              <li>
                <Link to="/browse?industry=bollywood" className="hover:text-brand-400 transition">Bollywood</Link>
              </li>
              <li>
                <Link to="/browse?industry=south-indian" className="hover:text-brand-400 transition">South Indian Cinema</Link>
              </li>
              <li>
                <Link to="/browse?industry=korean" className="hover:text-brand-400 transition">Korean Cinema & K-Drama</Link>
              </li>
              <li>
                <Link to="/browse?industry=japanese" className="hover:text-brand-400 transition">Japanese Cinema & Anime</Link>
              </li>
            </ul>
          </div>

          {/* Legal & DMCA */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/legal#dmca" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  DMCA & Takedown Policy
                </Link>
              </li>
              <li>
                <Link to="/legal#privacy" className="hover:text-brand-400 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/legal#terms" className="hover:text-brand-400 transition">Terms of Service</Link>
              </li>
              <li>
                <Link to="/legal#copyright" className="hover:text-brand-400 transition">Copyright Policy</Link>
              </li>
              <li>
                <Link to="/legal#about" className="hover:text-brand-400 transition">About CineVerse</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} CineVerse Platform. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Engineered with modern HLS streaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
