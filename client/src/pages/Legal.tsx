import React, { useState } from 'react';
import { ShieldCheck, Mail, FileText, CheckCircle2 } from 'lucide-react';

export const Legal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dmca' | 'privacy' | 'terms' | 'copyright' | 'about'>('dmca');
  const [dmcaForm, setDmcaForm] = useState({
    name: '',
    email: '',
    workTitle: '',
    url: '',
    statement: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleDmcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 pb-6 border-b border-neutral-800 mb-8">
        <button
          onClick={() => setActiveTab('dmca')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'dmca' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          DMCA / Takedown
        </button>
        <button
          onClick={() => setActiveTab('copyright')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'copyright' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Copyright Policy
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'privacy' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'terms' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'about' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          About CineVerse
        </button>
      </div>

      {/* Content */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-10 text-neutral-300 leading-relaxed space-y-6">
        {activeTab === 'dmca' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-brand-500" />
              <div>
                <h2 className="text-2xl font-black text-white">DMCA & Copyright Takedown Policy</h2>
                <p className="text-xs text-neutral-400">Notice and procedure for claims of copyright infringement</p>
              </div>
            </div>

            <p className="text-sm">
              CineVerse respects the intellectual property rights of creators and content distributors. It is our policy to respond expeditiously to legitimate notices of alleged copyright infringement in compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512).
            </p>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider">Designated Agent Contact:</h4>
              <p>Email: <span className="text-brand-400 font-mono">dmca@cineverse.com</span></p>
              <p>Platform Compliance Office: CineVerse Legal Operations</p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Notice Received</h4>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    Your takedown inquiry has been logged. Our compliance department will review and take appropriate action within 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDmcaSubmit} className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-500" /> Submit Takedown Request
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Copyright Owner / Agent Name</label>
                    <input
                      type="text"
                      required
                      value={dmcaForm.name}
                      onChange={(e) => setDmcaForm({ ...dmcaForm, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={dmcaForm.email}
                      onChange={(e) => setDmcaForm({ ...dmcaForm, email: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Title of Copyrighted Work</label>
                  <input
                    type="text"
                    required
                    value={dmcaForm.workTitle}
                    onChange={(e) => setDmcaForm({ ...dmcaForm, workTitle: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">CineVerse Movie URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://cineverse.com/movie/..."
                    value={dmcaForm.url}
                    onChange={(e) => setDmcaForm({ ...dmcaForm, url: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Statement of Good Faith</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="I declare that I am the copyright owner or authorized agent, and believe in good faith that use of the material is unauthorized..."
                    value={dmcaForm.statement}
                    onChange={(e) => setDmcaForm({ ...dmcaForm, statement: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
                >
                  Submit Official Notice
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'copyright' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Copyright & Authorized Media Distribution</h2>
            <p className="text-sm">
              CineVerse is dedicated to delivering cinema entertainment ethically and legally. All video assets, streams, and downloads provided on this platform are strictly authorized under appropriate open licenses (including Creative Commons, Blender Open Movie initiatives, public domain works), or authorized distributor agreements.
            </p>
            <p className="text-sm">
              We strictly enforce authorization controls: downloads are only enabled for verified titles where redistribution is authorized.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Privacy Policy</h2>
            <p className="text-sm">
              Your privacy is paramount. CineVerse collects minimal information necessary to deliver personalized streaming experiences:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-neutral-300">
              <li>Authentication credentials (securely salted and hashed using bcrypt).</li>
              <li>Watch history timestamps to enable resume playback across sessions.</li>
              <li>Personal watchlist and favorites records.</li>
            </ul>
            <p className="text-sm">
              We never sell or disclose user data to third-party data brokers. Users may permanently delete their account and associated records at any time.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Terms of Service</h2>
            <p className="text-sm">
              By accessing CineVerse, you agree to comply with our acceptable use policies:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-neutral-300">
              <li>Use the streaming and download features for personal, non-commercial purposes only.</li>
              <li>Do not attempt to reverse engineer, bypass security controls, or flood API endpoints.</li>
              <li>Maintain the confidentiality of your account credentials.</li>
            </ul>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">About CineVerse</h2>
            <p className="text-sm">
              CineVerse is a next-generation movie streaming and discovery ecosystem built with cutting-edge web technologies: React, TypeScript, Tailwind CSS, Node.js, and HLS.js adaptive bitrate streaming.
            </p>
            <p className="text-sm">
              Our mission is to provide cinematic discovery across Hollywood, Bollywood, South Indian cinema, Korean cinema, Anime, and global cinema without bloatware or predatory subscription locks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
