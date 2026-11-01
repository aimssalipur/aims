"use client";

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";

export interface ProtectedVideoPlayerRef {
  toggleFullscreen: () => void;
  togglePlay: () => void;
}

interface ProtectedVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  isLive?: boolean;
  watermark?: {
    name?: string;
    email?: string;
    phone?: string;
  } | string;
}

export const ProtectedVideoPlayer = React.forwardRef<
  ProtectedVideoPlayerRef,
  ProtectedVideoPlayerProps
>(function ProtectedVideoPlayer(
  { videoId, title = "Lecture Video", className = "", isLive = false, watermark },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIframeRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });

  useEffect(() => {
    if (!watermark) return;
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 65) + 12;
      const left = Math.floor(Math.random() * 60) + 8;
      setWatermarkPos({ top, left });
    }, 10000);
    return () => clearInterval(interval);
  }, [watermark]);

  const watermarkText =
    typeof watermark === "string"
      ? watermark
      : watermark
      ? `${watermark.name || "Student"}${watermark.phone ? ` • ${watermark.phone}` : watermark.email ? ` • ${watermark.email}` : ""}`
      : null;

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Reset controls hide timer
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        const existingScript = document.getElementById("yt-iframe-api");
        if (!existingScript) {
          const tag = document.createElement("script");
          tag.id = "yt-iframe-api";
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }

        const prevReady = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (prevReady) prevReady();
          initPlayer();
        };
      }
    };

    const initPlayer = () => {
      if (!playerIframeRef.current || !(window as any).YT) return;

      // If already initialized, just load the new video
      if (playerInstanceRef.current && playerInstanceRef.current.loadVideoById) {
        playerInstanceRef.current.loadVideoById(videoId);
        return;
      }

      try {
        const player = new (window as any).YT.Player(playerIframeRef.current, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0, // Disable YouTube default controls completely
            disablekb: 1, // Disable keyboard controls on YouTube iframe
            fs: 0, // Disable native fullscreen button
            modestbranding: 1,
            rel: 0, // Do not show unrelated videos
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              playerInstanceRef.current = event.target;
              setIsReady(true);
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event: any) => {
              const state = event.data;
              if (state === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
                setDuration(event.target.getDuration() || 0);
              } else if (state === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
                setShowControls(true);
              } else if (state === 3) {
                setIsBuffering(true);
              } else if (state === 0) {
                setIsPlaying(false);
                setIsBuffering(false);
                setShowControls(true);
              }
            },
          },
        });
      } catch (err) {
        console.error("Failed to init YouTube secure player:", err);
      }
    };

    loadYT();

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, [videoId]);

  // Sync current time interval
  useEffect(() => {
    if (isPlaying) {
      timeUpdateIntervalRef.current = setInterval(() => {
        if (playerInstanceRef.current && playerInstanceRef.current.getCurrentTime) {
          const cur = playerInstanceRef.current.getCurrentTime();
          setCurrentTime(cur);
          const dur = playerInstanceRef.current.getDuration();
          if (dur && dur !== duration) setDuration(dur);
        }
      }, 400);
    } else {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }

    return () => {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, [isPlaying, duration]);

  // Lock background scrolling when in Fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Sync with browser native fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc: any = document;
      const fsElem =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      // If user exits browser native fullscreen (via Esc)
      if (!fsElem && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Player actions
  const togglePlay = useCallback(() => {
    if (!playerInstanceRef.current) return;
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
    handleUserActivity();
  }, [isPlaying, handleUserActivity]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (playerInstanceRef.current && playerInstanceRef.current.seekTo) {
      playerInstanceRef.current.seekTo(time, true);
    }
    handleUserActivity();
  };

  const skipSeconds = useCallback((seconds: number) => {
    if (!playerInstanceRef.current) return;
    const cur = playerInstanceRef.current.getCurrentTime() || 0;
    const target = Math.max(0, Math.min(duration, cur + seconds));
    setCurrentTime(target);
    playerInstanceRef.current.seekTo(target, true);
    handleUserActivity();
  }, [duration, handleUserActivity]);

  // Full Window / Full Screen Toggle:
  // Guarantees 100% window takeover (no page content visible) while also triggering native fullscreen
  const toggleFullscreen = useCallback(() => {
    const doc: any = document;
    const elem: any = containerRef.current;

    setIsFullscreen((prev) => {
      const next = !prev;

      try {
        const isNative = !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        );

        if (next && !isNative && elem) {
          if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
          else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
          else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        } else if (!next && isNative) {
          if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
          else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
          else if (doc.msExitFullscreen) doc.msExitFullscreen();
        }
      } catch (err) {
        // Safe fallback: CSS fixed inset-0 already covers 100% of the screen
      }

      return next;
    });
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    toggleFullscreen,
    togglePlay,
  }), [toggleFullscreen, togglePlay]);

  // Keyboard shortcuts (f = fullscreen, space = play/pause, left/right = 10s skip, Escape = exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipSeconds(10);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen, togglePlay, skipSeconds, isFullscreen]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (!playerInstanceRef.current) return;
    if (val === 0) {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    } else {
      if (isMuted) {
        playerInstanceRef.current.unMute();
        setIsMuted(false);
      }
      playerInstanceRef.current.setVolume(val);
    }
    handleUserActivity();
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current) return;
    if (isMuted) {
      playerInstanceRef.current.unMute();
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
    handleUserActivity();
  };

  const changePlaybackRate = (rate: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    handleUserActivity();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`bg-black select-none group flex flex-col justify-between transition-all ${
        isFullscreen
          ? "fixed inset-0 !z-[999999] w-screen h-screen !rounded-none !m-0 !p-0 bg-black overflow-hidden flex items-center justify-center"
          : `relative w-full rounded-2xl aspect-video overflow-hidden shadow-xl ${className}`
      }`}
    >
      {/* 1. Centered Video Canvas Frame
          Strictly maintains 16:9 ratio in Fullscreen with cinematic black letterboxing (no cropping!) */}
      <div
        className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden ${
          isFullscreen ? "max-h-screen max-w-[calc(100vh*16/9)] aspect-video" : ""
        }`}
      >
        {/* Underlying YouTube iframe container - 100% dimensions */}
        <div className="absolute inset-0 w-full h-full pointer-events-none [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!border-0">
          <div ref={playerIframeRef} className="w-full h-full border-0" />
        </div>

        {/* Dynamic Anti-Leak Anti-Piracy Watermark Layer */}
        {watermarkText && (
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
            {/* Dynamic Tiny Floating Watermark Badge that shifts position every 10 seconds */}
            <div
              style={{
                top: `${watermarkPos.top}%`,
                left: `${watermarkPos.left}%`,
                transition: "top 1.5s ease-in-out, left 1.5s ease-in-out",
              }}
              className="absolute bg-black/25 backdrop-blur-[1px] border border-white/10 px-2 py-0.5 rounded-md text-white/30 text-[8px] sm:text-[9px] font-mono font-medium tracking-tight pointer-events-none select-none shadow-xs"
            >
              {watermarkText}
            </div>
          </div>
        )}

        {/* Full 100% Interactive Shield Overlay
            Completely covers the iframe so clicks NEVER reach YouTube directly */}
        <div
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.001)" }}
          className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center pointer-events-auto"
        >
          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="bg-black/75 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 text-white shadow-2xl">
              <Loader2 className="h-6 w-6 text-aims-gold animate-spin" />
              <span className="text-sm font-semibold tracking-wide">Buffering Lecture...</span>
            </div>
          )}

          {/* Center Play Button when paused */}
          {!isPlaying && !isBuffering && (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-aims-navy/90 hover:bg-aims-navy text-white flex items-center justify-center shadow-2xl border-2 border-white/20 transition-all transform hover:scale-110">
              <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1 text-aims-gold fill-aims-gold" />
            </div>
          )}
        </div>

        {/* Top Header inside video */}
        <div
          className={`absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between text-white ${
            showControls || !isPlaying || isFullscreen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 max-w-[70%] truncate">
            <div className={`h-2 w-2 rounded-full ${isLive ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-100 truncate">
              {title}
            </span>
            {isLive && (
              <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                Live Broadcast
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-300">
              <ShieldAlert className="h-3 w-3 text-emerald-400" />
              <span>AIMS Secure Stream</span>
            </div>

            {isFullscreen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer"
                title="Exit Fullscreen (Esc or F)"
              >
                <X className="h-4 w-4" />
                <span>Exit Full Screen</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Custom In-Video Controls Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 space-y-2 text-white ${
            showControls || !isPlaying
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Scrub Bar / Timeline */}
          {!isLive ? (
            <div className="relative group/timeline flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-aims-gold hover:h-2 transition-all"
                style={{
                  background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.2) ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          ) : (
            <div className="h-1 bg-red-600/30 rounded-full overflow-hidden flex items-center">
              <div className="h-full bg-red-600 w-full animate-pulse" />
            </div>
          )}

          {/* Controls Row */}
          <div className="flex items-center justify-between text-xs font-semibold gap-2">
            {/* Left Controls: Play/Pause, Skip, Volume, Time */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white hover:text-aims-gold transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>

              {!isLive && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      skipSeconds(-10);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title="Rewind 10s (←)"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      skipSeconds(10);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title="Forward 10s (→)"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Time display */}
              {!isLive ? (
                <span className="text-[11px] sm:text-xs text-slate-300 font-mono tracking-tight">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/90 rounded text-[11px] text-white font-extrabold tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>LIVE</span>
                </div>
              )}
            </div>

            {/* Right Controls: Speed, In-Player Fullscreen Toggle */}
            <div className="flex items-center gap-2 relative">
              {/* Speed Selector (VOD only) */}
              {!isLive && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu(!showSpeedMenu);
                    }}
                    className="px-2 py-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors text-[11px] font-bold"
                  >
                    {playbackRate}x
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-md flex flex-col gap-0.5 min-w-[70px]">
                      {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            changePlaybackRate(rate);
                          }}
                          className={`px-3 py-1 text-left text-xs rounded-lg transition-colors ${
                            playbackRate === rate
                              ? "bg-aims-gold text-slate-950 font-bold"
                              : "text-slate-200 hover:bg-white/10"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* In-Player Fullscreen Icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Explicit Dedicated Full Screen Bar (Only shown in normal non-fullscreen mode) */}
      {!isFullscreen && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-slate-200">AIMS Protected Video</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono text-[10px]">F</kbd> or double-click to expand
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Maximize className="h-4 w-4" />
            <span>Full Screen Mode</span>
          </button>
        </div>
      )}
    </div>
  );
});
