import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  PictureInPicture,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { VideoSource, SubtitleTrack } from '../../types/index.js';

interface VideoPlayerProps {
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
  title: string;
  initialProgress?: number;
  onProgressUpdate?: (seconds: number, duration: number) => void;
  poster?: string;
}

interface QualityLevel {
  index: number;
  label: string;
  height: number;
  bitrate?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources,
  subtitles = [],
  title,
  initialProgress = 0,
  onProgressUpdate,
  poster,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Controls Visibility
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settings & Menus
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [activeSubtitle, setActiveSubtitle] = useState<string>('off');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'quality' | 'subs'>('main');

  // Primary source
  const primarySource = sources.find((s) => s.isPrimary) || sources[0];

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !primarySource) return;

    setError(null);
    setIsBuffering(true);

    const streamUrl = primarySource.streamUrl;
    const isHlsSource =
      primarySource.format.toLowerCase() === 'hls' || streamUrl.endsWith('.m3u8');

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsSource && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsBuffering(false);
        const levels: QualityLevel[] = [
          { index: -1, label: 'Auto (Recommended)', height: 0 },
          ...data.levels.map((lvl, idx) => ({
            index: idx,
            label: `${lvl.height}p${lvl.bitrate ? ` (${Math.round(lvl.bitrate / 1000)} kbps)` : ''}`,
            height: lvl.height,
            bitrate: lvl.bitrate,
          })),
        ];
        setQualityLevels(levels);

        // Resume playback if progress passed
        if (initialProgress > 0 && initialProgress < video.duration) {
          video.currentTime = initialProgress;
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // Updated current level
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media error, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error:', data);
              hls.destroy();
              // Try fallback to MP4 source if available
              const mp4Fallback = sources.find((s) => s.format === 'mp4');
              if (mp4Fallback && mp4Fallback.streamUrl !== streamUrl) {
                video.src = mp4Fallback.streamUrl;
              } else {
                setError('Unable to load video stream. Please check connection or try again.');
              }
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari HLS support
      video.src = streamUrl;
      if (initialProgress > 0) video.currentTime = initialProgress;
    } else {
      // Direct MP4 / WebM video source
      video.src = streamUrl;
      if (initialProgress > 0) video.currentTime = initialProgress;
      setQualityLevels([
        { index: 0, label: primarySource.qualityLabel || 'Standard HD', height: 1080 },
      ]);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [primarySource]);

  // Video Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (onProgressUpdate && Math.floor(video.currentTime) % 5 === 0) {
        onProgressUpdate(Math.floor(video.currentTime), Math.floor(video.duration || 0));
      }
    };

    const handleDurationChange = () => setDuration(video.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onProgressUpdate) onProgressUpdate(Math.floor(video.duration), Math.floor(video.duration));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgressUpdate]);

  // Mouse Idle Auto-hide Controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          toggleSubtitles();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  // Playback Controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seekDelta = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const adjustVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = Math.max(0, Math.min(1, volume + delta));
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = parseFloat(e.target.value);
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setIsSettingsOpen(false);
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setIsSettingsOpen(false);
  };

  const handleSubtitleChange = (lang: string) => {
    const video = videoRef.current;
    if (!video) return;

    setActiveSubtitle(lang);
    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      if (lang === 'off') {
        track.mode = 'disabled';
      } else if (track.language === lang) {
        track.mode = 'showing';
      } else {
        track.mode = 'disabled';
      }
    }
    setIsSettingsOpen(false);
  };

  const toggleSubtitles = () => {
    if (activeSubtitle === 'off') {
      const first = subtitles[0]?.language || 'en';
      handleSubtitleChange(first);
    } else {
      handleSubtitleChange('off');
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-neutral-800"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        onClick={togglePlay}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      >
        {subtitles.map((sub) => (
          <track
            key={sub.id}
            kind="subtitles"
            src={sub.vttUrl}
            srcLang={sub.language}
            label={sub.label}
            default={sub.isDefault}
          />
        ))}
      </video>

      {/* Buffering Spinner */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-20">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center z-30">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">Playback Error</h4>
          <p className="text-sm text-neutral-400 max-w-md mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              videoRef.current?.load();
            }}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition"
          >
            Retry Stream
          </button>
        </div>
      )}

      {/* Top Bar (Title overlay) */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h3 className="text-sm sm:text-base font-semibold text-white truncate drop-shadow">{title}</h3>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Seek Bar */}
        <div className="relative group/seek mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 hover:h-2.5 rounded-lg appearance-none cursor-pointer bg-neutral-700/60 accent-brand-500 transition-all"
            style={{
              background: `linear-gradient(to right, #e50914 0%, #e50914 ${
                duration ? (currentTime / duration) * 100 : 0
              }%, #404040 ${duration ? (currentTime / duration) * 100 : 0}%, #404040 ${
                duration ? (buffered / duration) * 100 : 0
              }%, #262626 ${duration ? (buffered / duration) * 100 : 0}%, #262626 100%)`,
            }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-neutral-200">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-white transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => seekDelta(-10)}
              className="p-1.5 hover:text-white transition"
              title="Rewind 10 seconds (J or ←)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => seekDelta(10)}
              className="p-1.5 hover:text-white transition"
              title="Forward 10 seconds (L or →)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/volume">
              <button onClick={toggleMute} className="p-1.5 hover:text-white transition">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-neutral-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded-lg appearance-none cursor-pointer bg-neutral-700 accent-brand-500 opacity-80 group-hover/volume:opacity-100 transition"
              />
            </div>

            {/* Time Display */}
            <span className="text-xs text-neutral-400 font-mono ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Subtitles Button */}
            {subtitles.length > 0 && (
              <button
                onClick={toggleSubtitles}
                className={`p-1.5 transition ${
                  activeSubtitle !== 'off' ? 'text-brand-500' : 'hover:text-white text-neutral-400'
                }`}
                title="Subtitles (C)"
              >
                <Subtitles className="w-5 h-5" />
              </button>
            )}

            {/* Settings Menu Button */}
            <button
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
                setSettingsTab('main');
              }}
              className="p-1.5 hover:text-white transition"
              title="Settings"
            >
              <Settings className={`w-5 h-5 ${isSettingsOpen ? 'text-brand-500' : ''}`} />
            </button>

            {/* Settings Flyout Modal */}
            {isSettingsOpen && (
              <div className="absolute right-0 bottom-10 w-52 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 text-xs z-40">
                {settingsTab === 'main' && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setSettingsTab('speed')}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 transition"
                    >
                      <span>Speed</span>
                      <span className="text-neutral-400 font-medium">{playbackSpeed}x →</span>
                    </button>
                    {qualityLevels.length > 0 && (
                      <button
                        onClick={() => setSettingsTab('quality')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 transition"
                      >
                        <span>Quality</span>
                        <span className="text-neutral-400 font-medium truncate max-w-[100px]">
                          {qualityLevels.find((q) => q.index === currentQuality)?.label || 'Auto'} →
                        </span>
                      </button>
                    )}
                    {subtitles.length > 0 && (
                      <button
                        onClick={() => setSettingsTab('subs')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 transition"
                      >
                        <span>Subtitles</span>
                        <span className="text-neutral-400 font-medium">
                          {activeSubtitle === 'off' ? 'Off' : activeSubtitle} →
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {settingsTab === 'speed' && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSettingsTab('main')}
                      className="text-[11px] font-semibold text-neutral-400 p-1 mb-1 block"
                    >
                      ← Back
                    </button>
                    {speeds.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between ${
                          playbackSpeed === s ? 'text-brand-500 font-bold bg-neutral-800' : 'hover:bg-neutral-800'
                        }`}
                      >
                        <span>{s}x</span>
                        {playbackSpeed === s && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}

                {settingsTab === 'quality' && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSettingsTab('main')}
                      className="text-[11px] font-semibold text-neutral-400 p-1 mb-1 block"
                    >
                      ← Back
                    </button>
                    {qualityLevels.map((q) => (
                      <button
                        key={q.index}
                        onClick={() => handleQualityChange(q.index)}
                        className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between ${
                          currentQuality === q.index ? 'text-brand-500 font-bold bg-neutral-800' : 'hover:bg-neutral-800'
                        }`}
                      >
                        <span>{q.label}</span>
                        {currentQuality === q.index && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}

                {settingsTab === 'subs' && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSettingsTab('main')}
                      className="text-[11px] font-semibold text-neutral-400 p-1 mb-1 block"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleSubtitleChange('off')}
                      className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between ${
                        activeSubtitle === 'off' ? 'text-brand-500 font-bold bg-neutral-800' : 'hover:bg-neutral-800'
                      }`}
                    >
                      <span>Off</span>
                      {activeSubtitle === 'off' && <span>✓</span>}
                    </button>
                    {subtitles.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubtitleChange(sub.language)}
                        className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between ${
                          activeSubtitle === sub.language ? 'text-brand-500 font-bold bg-neutral-800' : 'hover:bg-neutral-800'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {activeSubtitle === sub.language && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Picture in Picture */}
            <button onClick={togglePiP} className="p-1.5 hover:text-white transition" title="Picture in Picture">
              <PictureInPicture className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-1.5 hover:text-white transition" title="Fullscreen (F)">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
