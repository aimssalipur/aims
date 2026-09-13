"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Download,
  X,
  Sparkles,
  Smartphone,
  Share,
  PlusSquare,
  ShieldCheck,
  Zap,
  Bell,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Check if already running in standalone (PWA installed) mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 3. Check if user dismissed prompt recently (within last 3 days)
    const dismissedAt = localStorage.getItem("aims_pwa_dismissed_at");
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        return;
      }
    }

    // 4. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|crmo|firefox|fxios/.test(userAgent);

    if (isIosDevice) {
      setIsIOS(true);
      // On iOS Safari, show after a friendly 4-second delay
      const timer = setTimeout(() => {
        if (!checkStandalone()) {
          setShowPrompt(true);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }

    // 5. Listen for Android / Chrome / Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds for initial page experience before showing bottom popup
      setTimeout(() => {
        if (!checkStandalone()) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem("aims_pwa_installed", "true");
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("aims_pwa_dismissed_at", Date.now().toString());
  };

  if (isStandalone || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-labelledby="pwa-title"
      aria-describedby="pwa-desc"
      className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-[99990] animate-in fade-in slide-in-from-bottom-6 duration-500"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(30,58,138,0.3)] p-4 sm:p-5">
        {/* Decorative background glow elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header: App Brand Info */}
        <div className="flex items-start gap-3.5 mb-3.5 pr-6">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-gradient-to-br from-aims-navy to-blue-700 p-1.5 shadow-md shadow-aims-navy/25 flex items-center justify-center border border-white/40">
            <Image
              src="/logo.png"
              alt="AIMS Salipur Logo"
              width={56}
              height={56}
              className="object-contain brightness-110 drop-shadow-sm"
              priority
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
              <ShieldCheck className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-aims-navy/10 text-[10px] font-extrabold uppercase tracking-wider text-aims-navy">
                <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                Official Web App
              </span>
            </div>
            <h3
              id="pwa-title"
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate"
            >
              Install AIMS Salipur
            </h3>
            <p
              id="pwa-desc"
              className="text-xs text-slate-500 font-medium leading-tight mt-0.5 truncate"
            >
              Nursing Academy &amp; Student LMS
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="truncate">Fast &amp; Offline</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <Bell className="h-3 w-3 text-blue-500 shrink-0" />
            <span className="truncate">Live Alerts</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <Smartphone className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="truncate">1-Tap Access</span>
          </div>
        </div>

        {/* Action Area: Android/Chrome vs iOS instructions */}
        {isIOS ? (
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/70 p-3 text-xs text-amber-900">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <span>Install on iPhone / iPad:</span>
            </p>
            <ol className="space-y-1 text-[11px] text-amber-800 list-decimal list-inside font-medium">
              <li>
                Tap the <Share className="inline h-3.5 w-3.5 text-blue-600 mx-0.5" />{" "}
                <strong>Share</strong> button in Safari toolbar
              </li>
              <li>
                Scroll down and tap{" "}
                <PlusSquare className="inline h-3.5 w-3.5 text-slate-700 mx-0.5" />{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>
              </li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="w-full mt-2.5 h-8 text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-100/60"
            >
              Got it, thanks!
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 pt-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 h-11 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Maybe Later
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="flex-[1.5] h-11 gap-2 text-xs sm:text-sm font-extrabold shadow-lg shadow-aims-navy/30 bg-gradient-to-r from-aims-navy via-blue-700 to-aims-navy hover:from-blue-700 hover:to-aims-navy text-white rounded-xl group transition-all"
            >
              <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Install App
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
