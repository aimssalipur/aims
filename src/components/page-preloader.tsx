"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export function PagePreloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(15);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem("aims_entry_screen_v6", "true");
      } catch (_) {}
    }, 400);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("aims_entry_screen_v6")) {
        setLoading(false);
        return;
      }
    } catch (_) {}

    // Dynamic progress bar acceleration
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const inc = Math.floor(Math.random() * 24 + 18);
        return Math.min(prev + inc, 100);
      });
    }, 180);

    // Auto dismiss after ~1.4s
    const finishTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        dismiss();
      }, 300);
    }, 1350);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [dismiss]);

  if (!loading) return null;

  return (
    <div
      onClick={dismiss}
      role="dialog"
      aria-label="Loading AIMS Salipur"
      style={{ backgroundColor: "#ffffff" }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white select-none transition-all duration-350 cursor-pointer ${
        fadeOut ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic breathing ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-aura" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center px-4">
        {/* Animated Circular Logo Showcase */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle spinning orbital ring */}
          <div className="absolute -inset-2.5 sm:-inset-3 rounded-full border border-dashed border-emerald-500/30 animate-orbit pointer-events-none" />

          {/* Breathing soft glow halo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-aims-navy/15 to-emerald-500/20 blur-md animate-aura pointer-events-none" />

          {/* Logo pedestal with spring entrance & floating levitation */}
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-white p-2.5 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-100 flex items-center justify-center animate-logo-entrance">
            <Image
              src="/logo.png"
              alt="AIMS Salipur"
              width={120}
              height={120}
              priority
              quality={100}
              className="h-full w-full object-contain rounded-full select-none"
            />
          </div>
        </div>

        {/* Minimal, elegant brand title with staggered fade-in */}
        <div className="animate-text-entrance flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
            AIMS <span className="text-emerald-600">SALIPUR</span>
          </h1>
          <p className="mt-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Achyutanand Institute of Medical Science
          </p>
        </div>

        {/* Sleek hairline progress bar with gliding light shimmer */}
        <div className="mt-7 w-44 sm:w-52 h-1 bg-slate-100 rounded-full overflow-hidden relative shadow-inner animate-fade-in">
          <div
            className="h-full rounded-full bg-gradient-to-r from-aims-navy via-emerald-600 to-emerald-500 transition-all duration-200 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Moving light shimmer across progress */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Scoped CSS Keyframe Animations */}
      <style jsx>{`
        .animate-logo-entrance {
          animation: logoEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            logoFloat 2.6s ease-in-out 0.7s infinite alternate;
        }

        .animate-orbit {
          animation: spinOrbit 14s linear infinite;
        }

        .animate-aura {
          animation: auraBreathe 2.4s ease-in-out infinite alternate;
        }

        .animate-text-entrance {
          animation: textFadeIn 0.6s ease-out 0.2s both;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out 0.3s both;
        }

        .animate-shimmer {
          animation: barShimmer 1.2s ease-in-out infinite;
        }

        @keyframes logoEntrance {
          0% {
            transform: scale(0.8) translateY(16px);
            opacity: 0;
          }
          65% {
            transform: scale(1.05) translateY(-3px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes logoFloat {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-6px);
          }
        }

        @keyframes spinOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes auraBreathe {
          0% {
            transform: scale(0.95);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.08);
            opacity: 0.8;
          }
        }

        @keyframes textFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes barShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
