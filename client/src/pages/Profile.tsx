import React, { useState } from 'react';
import { User, Mail, Shield, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);
    try {
      await updateProfile({ name, avatar });
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-black text-white mb-1">Account Settings</h1>
        <p className="text-xs text-neutral-400 mb-6">Manage your profile details and preferences</p>

        {status && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-xl text-xs mb-6 ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-neutral-800">
            <img
              src={
                avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e50914&color=fff`
              }
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-neutral-700"
            />
            <div>
              <span className="text-sm font-semibold text-white block">{user.name}</span>
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                {user.role === 'ADMIN' ? (
                  <span className="text-brand-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Administrator
                  </span>
                ) : (
                  'Standard Member'
                )}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Avatar Image URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
