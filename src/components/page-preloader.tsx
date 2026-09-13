"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOADING_MESSAGES = [
  "Preparing your clinical classroom...",
  "Loading high-yield nursing notes...",
  "Calibrating mock tests & MCQs...",
  "Welcome to AIMS Salipur! ✨",
];

export function PagePreloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check if previously loaded in session to avoid interrupting frequent navigation
    const hasLoaded = sessionStorage.getItem("aims_preloaded_v2");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    // Message ticker interval (Blinkit style lively step messages)
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 450);

    // Progress bar simulation
    const pInterval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + Math.floor(Math.random() * 20 + 15) : 100));
    }, 200);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          sessionStorage.setItem("aims_preloaded_v2", "true");
        }, 400);
      }, 350);
    }, 1400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(pInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-50/98 backdrop-blur-3xl select-none transition-all duration-400 ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glows matching AIMS theme */}
      <div className="absolute top-1/4 -left-12 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

      {/* Main Blinkit-Style Center Content */}
      <div className="relative flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Animated SVG Medical Bag / Stethoscope with Blinkit-Style Bounce */}
        <div className="relative flex flex-col items-center mb-6">
          {/* Sparkles floating around */}
          <div className="absolute -top-3 -right-4 text-amber-400 animate-bounce [animation-duration:1s]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
          </div>
          <div className="absolute top-8 -left-5 text-emerald-400 animate-pulse [animation-duration:1.5s]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
          </div>

          {/* Bouncing Medical Kit SVG (Squash & Stretch) */}
          <div className="blinkit-bounce-icon relative">
            <svg
              viewBox="0 0 160 150"
              className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-2xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* AIMS Navy & Blue Gradient */}
                <linearGradient id="aimsBagGrad" x1="20" y1="40" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="60%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                {/* Bag Border Accent */}
                <linearGradient id="aimsBorderGrad" x1="30" y1="40" x2="130" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                {/* Gold Glow Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Bag Handle */}
              <path
                d="M58 46V30C58 20 68 14 80 14C92 14 102 20 102 30V46"
                stroke="#F59E0B"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Handle Metal Brackets */}
              <rect x="52" y="40" width="12" height="10" rx="3" fill="#D97706" />
              <rect x="96" y="40" width="12" height="10" rx="3" fill="#D97706" />

              {/* Main Medical Kit Body */}
              <rect
                x="20"
                y="44"
                width="120"
                height="92"
                rx="26"
                fill="url(#aimsBagGrad)"
                stroke="url(#aimsBorderGrad)"
                strokeWidth="3.5"
              />

              {/* Front Pocket / Medical Cross Emblem */}
              <rect x="36" y="60" width="88" height="64" rx="16" fill="#0F172A" fillOpacity="0.25" />

              {/* Medical Cross (White Base) */}
              <rect x="71" y="68" width="18" height="48" rx="5" fill="white" />
              <rect x="56" y="83" width="48" height="18" rx="5" fill="white" />

              {/* Medical Cross (Emerald Inset) */}
              <rect x="74" y="71" width="12" height="42" rx="3" fill="#10B981" />
              <rect x="59" y="86" width="42" height="12" rx="3" fill="#10B981" />

              {/* Animated Glowing ECG / Heartbeat line */}
              <path
                d="M26 116H46L54 106L62 126L72 98L81 122L89 110L96 118H134"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="blinkit-ecg"
                filter="url(#goldGlow)"
              />

              {/* Stethoscope Tag */}
              <circle cx="124" cy="56" r="9" fill="#10B981" stroke="white" strokeWidth="2.5" />
              <circle cx="124" cy="56" r="4" fill="white" />
            </svg>
          </div>

          {/* Dynamic Floor Shadow (shrinks on jump, expands on ground) */}
          <div className="blinkit-shadow h-2.5 w-20 bg-slate-400/30 rounded-full blur-xs mt-1" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <div className="h-6 w-6 rounded-lg bg-aims-navy p-1 shadow-sm flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="AIMS"
              width={20}
              height={20}
              className="object-contain brightness-110"
              quality={100}
            />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            AIMS <span className="text-emerald-600">SALIPUR</span>
          </span>
        </div>

        {/* Blinkit-Style Pill Badge with Live Pulsing Dot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 transition-all duration-300">
            {LOADING_MESSAGES[msgIndex]}
          </span>
        </div>

        {/* Blinkit-Style Striped Candy Progress Bar */}
        <div className="w-56 sm:w-64 h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner relative border border-slate-200">
          <div
            className="h-full rounded-full transition-all duration-200 ease-out relative overflow-hidden bg-gradient-to-r from-aims-navy via-aims-green to-aims-gold"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {/* Moving Striped Shimmer Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[blinkitStripes_0.8s_linear_infinite]" />
          </div>
        </div>

        {/* Subtitle / Exam Focus */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <span>OSSSC</span>
          <span>•</span>
          <span>NORCET</span>
          <span>•</span>
          <span>ESIC</span>
          <span>•</span>
          <span>MNS</span>
        </div>
      </div>

      {/* Embedded Blinkit Animation Physics Styles */}
      <style jsx>{`
        /* Energetic Squash & Stretch Physics */
        .blinkit-bounce-icon {
          animation: blinkitBounce 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
        }

        .blinkit-shadow {
          animation: blinkitShadow 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
        }

        .blinkit-ecg {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: blinkitEcgDraw 1.2s linear infinite;
        }

        @keyframes blinkitBounce {
          0% {
            transform: translateY(0) scale(1.08, 0.92);
          }
          30% {
            transform: translateY(-8px) scale(0.96, 1.04);
          }
          100% {
            transform: translateY(-24px) scale(0.92, 1.08);
          }
        }

        @keyframes blinkitShadow {
          0% {
            transform: scale(1.15);
            opacity: 0.6;
          }
          100% {
            transform: scale(0.65);
            opacity: 0.2;
          }
        }

        @keyframes blinkitEcgDraw {
          0% {
            stroke-dashoffset: 200;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -200;
          }
        }

        @keyframes blinkitStripes {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 16px 0;
          }
        }
      `}</style>
    </div>
  );
}
