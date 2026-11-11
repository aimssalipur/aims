"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CoursePosterBannerProps {
  title: string;
  thumbnailUrl?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Checks whether a thumbnail is a legitimate uploaded poster image
 * (excludes empty strings and dummy unsplash stock photos)
 */
export function hasValidCoursePoster(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === "" || trimmed.includes("unsplash.com")) return false;
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  );
}

export function CoursePosterBanner({
  title,
  thumbnailUrl,
  className,
  sizes = "(max-width: 768px) 100vw, 400px",
  priority = false,
}: CoursePosterBannerProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [thumbnailUrl]);

  const hasImage = !imageError && hasValidCoursePoster(thumbnailUrl);

  if (hasImage && thumbnailUrl) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={thumbnailUrl.startsWith("data:") || thumbnailUrl.includes("supabase.co") || thumbnailUrl.startsWith("http")}
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle dark gradient overlay only on real images so top/bottom badges stay legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Fallback: Rich institutional poster graphic with official AIMS Logo and prominent course name
  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-gradient-to-br from-[#061528] via-[#0c233c] to-[#032622] flex flex-col items-center justify-center p-3 text-center select-none",
        className
      )}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/25 rounded-full blur-2xl pointer-events-none" />

      {/* Subtle watermark background logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
        <Image
          src="/logo.png"
          alt=""
          width={150}
          height={150}
          className="object-contain filter grayscale"
        />
      </div>

      {/* Banner Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-[340px] px-2 py-1 my-auto">
        {/* Official Logo Emblem Badge */}
        <div className="relative mb-2 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white p-1 shadow-md ring-2 ring-white/25 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/logo.png"
            alt="AIMS Salipur Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>

        {/* High-Contrast Prominent Course Name */}
        <h3 className="text-white font-black text-xs sm:text-sm md:text-base leading-snug tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] line-clamp-3 px-1">
          {title}
        </h3>
      </div>
    </div>
  );
}
