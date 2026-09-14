import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | AIMS Salipur",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] sm:w-[36rem] h-[28rem] sm:h-[36rem] bg-gradient-to-tr from-aims-green/10 via-aims-navy/5 to-emerald-100/30 rounded-full blur-3xl -z-10" />
        </div>

        <div className="max-w-xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Custom Modern SVG Vector Illustration */}
          <div className="w-64 sm:w-80 h-56 sm:h-64 relative mb-6 select-none animate-fade-in">
            <svg
              viewBox="0 0 400 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xl"
            >
              {/* Definitions for Gradients & Filters */}
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1B365D" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0D8267" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1B365D" />
                  <stop offset="100%" stopColor="#0D8267" />
                </linearGradient>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D8267" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background Circular Platform */}
              <ellipse cx="200" cy="245" rx="140" ry="24" fill="url(#bgGrad)" />
              
              {/* Floating Base Shapes */}
              <circle cx="200" cy="155" r="95" fill="white" filter="url(#softShadow)" />
              <circle cx="200" cy="155" r="90" fill="url(#bgGrad)" opacity="0.5" />

              {/* 404 Numerals */}
              <text
                x="85"
                y="175"
                fill="#1B365D"
                fontSize="84"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                opacity="0.95"
              >
                4
              </text>
              <text
                x="260"
                y="175"
                fill="#1B365D"
                fontSize="84"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                opacity="0.95"
              >
                4
              </text>

              {/* Center Magnifier / Compass Sphere */}
              <g transform="translate(160, 115)">
                {/* Outer Ring */}
                <circle cx="40" cy="40" r="38" fill="white" stroke="url(#primaryGrad)" strokeWidth="8" />
                {/* Inner Compass / Medical Cross Core */}
                <circle cx="40" cy="40" r="28" fill="#ECFDF5" />
                
                {/* Medical Cross Symbol */}
                <rect x="36" y="24" width="8" height="32" rx="4" fill="url(#accentGrad)" />
                <rect x="24" y="36" width="32" height="8" rx="4" fill="url(#accentGrad)" />
                
                {/* Lens Flare Dot */}
                <circle cx="28" cy="28" r="4" fill="white" opacity="0.8" />

                {/* Magnifier Handle */}
                <path
                  d="M66 66 L86 86"
                  stroke="#1B365D"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </g>

              {/* Floating Book Vector (Left) */}
              <g transform="translate(60, 80) rotate(-12)">
                <rect x="0" y="0" width="34" height="24" rx="4" fill="#0D8267" />
                <path d="M17 0 L17 24" stroke="white" strokeWidth="2" opacity="0.6" />
                <rect x="4" y="5" width="9" height="3" rx="1.5" fill="white" opacity="0.8" />
                <rect x="4" y="11" width="9" height="3" rx="1.5" fill="white" opacity="0.8" />
                <rect x="21" y="5" width="9" height="3" rx="1.5" fill="white" opacity="0.8" />
              </g>

              {/* Floating Graduation Cap (Right) */}
              <g transform="translate(295, 80) rotate(15)">
                <path d="M22 4 L44 14 L22 24 L0 14 Z" fill="#1B365D" />
                <rect x="12" y="19" width="20" height="9" rx="2" fill="#0E2340" />
                <path d="M38 16 L38 28" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="29" r="2" fill="#F59E0B" />
              </g>

            </svg>
          </div>

          {/* Minimal, Clear Messaging */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Page Not Found
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Lost your way?
          </h1>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable. Let&apos;s get you back on track.
          </p>

          {/* Clean, Focused Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              asChild
              className="w-full sm:w-auto gap-2 px-6 h-11 sm:h-12 shadow-lg shadow-aims-navy/15 text-sm font-bold"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto gap-2 px-6 h-11 sm:h-12 border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold"
            >
              <Link href="/#courses">
                <BookOpen className="h-4 w-4" />
                Explore Courses
              </Link>
            </Button>

            <a
              href="https://wa.me/919437959054"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-xs font-semibold text-slate-400 hover:text-aims-green transition-colors inline-flex items-center justify-center gap-1.5 py-2 sm:px-3"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Need help? Chat with us
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
