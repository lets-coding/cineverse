import React, { useState } from 'react';
import { X, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DownloadSource } from '../../types/index.js';
import { api } from '../../api/client.js';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  movieTitle: string;
  downloadEnabled: boolean;
  downloadSources: DownloadSource[];
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  movieId,
  movieTitle,
  downloadEnabled,
  downloadSources,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadClick = async (source: DownloadSource) => {
    setDownloadingId(source.id);
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      const res = await api.getAuthorizedDownload(movieId, source.id);
      if (res.success && res.data.downloadUrl) {
        setDownloadSuccess(source.qualityLabel);
        // Create programmatic anchor download trigger
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.download = `${movieTitle.replace(/\s+/g, '_')}_${source.resolution}.${source.format}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setDownloadError('Unable to generate download link. Please try again.');
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Download authorization failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-500 border border-brand-500/30 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Download Options</h3>
            <p className="text-xs text-neutral-400 truncate max-w-xs">{movieTitle}</p>
          </div>
        </div>

        {/* Authorized Compliance Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-5">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Authorized Direct High-Speed Download • Verified Virus-Free Media</span>
        </div>

        {downloadSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Download initiated for {downloadSuccess}. Check your browser downloads.</span>
          </div>
        )}

        {downloadError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Download Sources List */}
        {!downloadEnabled ? (
          <div className="p-6 text-center text-neutral-400 text-sm bg-neutral-950 rounded-xl border border-neutral-800">
            Downloads are currently not authorized or disabled by the distributor for this title. You can still stream it online in HD.
          </div>
        ) : downloadSources.length === 0 ? (
          <div className="p-6 text-center text-neutral-400 text-sm bg-neutral-950 rounded-xl border border-neutral-800">
            No download renditions are configured for this movie at this moment.
          </div>
        ) : (
          <div className="space-y-2.5">
            {downloadSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{source.qualityLabel}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-neutral-800 text-neutral-300">
                      {source.format}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Resolution: {source.resolution} • Size: {source.fileSize}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadClick(source)}
                  disabled={downloadingId === source.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shadow-md shadow-brand-600/30 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingId === source.id ? 'Connecting...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-neutral-500 text-center mt-5">
          By downloading, you agree to CineVerse&apos;s authorized personal media usage guidelines.
        </p>
      </div>
    </div>
  );
};
