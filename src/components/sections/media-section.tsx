"use client";

import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { instagramImages } from "@/lib/dummy-data";
import {
  Play,
  ExternalLink,
  Instagram,
  Youtube,
  Sparkles,
  Camera,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useFrontendImages } from "@/lib/frontend-images";
import gsap from "gsap";

export function MediaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const frontendImages = useFrontendImages();

  useGSAP(() => {
    gsap.from(".media-yt-text", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".media-col-left",
        start: "top 85%",
      },
    });

    gsap.from(".media-ig-text", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".media-col-right",
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      id="media"
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-100/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-1 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* YouTube Section */}
          <div className="media-col-left">
            <div className="media-yt-text inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-50 mb-2.5 sm:mb-3">
              <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-red-700">
                YouTube Channel
              </span>
            </div>
            <h2 className="media-yt-text text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1.5 sm:mb-2">
              Learn from <span className="text-red-500">Anywhere</span>, Anytime
            </h2>
            <p className="media-yt-text text-slate-600 text-xs sm:text-base leading-relaxed mb-3 sm:mb-5 line-clamp-2 sm:line-clamp-none">
              Subscribe to our official channel for video lectures, nursing mock test
              discussions, and clinical demos.
            </p>

            <Card className="overflow-hidden border-0 shadow-lg group hover:shadow-red-500/20 transition-all duration-300 rounded-xl sm:rounded-2xl">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-aims-navy to-slate-900 overflow-hidden">
                  <Image
                    src={
                      frontendImages.youtube_thumb ||
                      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=675&fit=crop"
                    }
                    alt="AIMS YouTube Channel"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                    unoptimized={frontendImages.youtube_thumb?.startsWith("data:")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <a
                      href="https://www.youtube.com/@AIMS_Official"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn relative"
                      aria-label="Play video"
                    >
                      <div className="relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-white shadow-xl flex items-center justify-center group-hover/btn:bg-red-500 transition-all duration-300 group-hover/btn:scale-110">
                        <Play
                          className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500 ml-0.5 group-hover/btn:text-white transition-colors"
                          fill="currentColor"
                        />
                      </div>
                    </a>
                  </div>

                  <div className="absolute bottom-2.5 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 flex items-end justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 mb-1 animate-pulse">
                        <div className="h-1 w-1 rounded-full bg-white" />
                        <span className="text-[9px] font-bold uppercase text-white tracking-widest">
                          Featured
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-white drop-shadow leading-tight">
                        AIMS Official - Medical Hub
                      </h3>
                    </div>
                    <Badge variant="destructive" className="hidden sm:flex items-center gap-1 bg-red-500 px-2.5 py-0.5 text-xs font-bold">
                      <Sparkles className="h-3 w-3" />
                      100K+ Subs
                    </Badge>
                  </div>
                </div>

                <div className="p-3 sm:p-5 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shrink-0">
                      <Youtube className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        @AIMS_Official
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                        500+ Videos · Weekly Classes
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://www.youtube.com/@AIMS_Official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="primary" size="sm" className="h-8 sm:h-9 bg-red-500 hover:bg-red-600 gap-1.5 shadow-sm rounded-lg sm:rounded-xl font-bold text-xs px-3">
                      <span>Subscribe</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instagram Section */}
          <div className="media-col-right">
            <div className="media-ig-text inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-50 via-fuchsia-50 to-amber-50 mb-2.5 sm:mb-3">
              <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-600" />
              <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 via-fuchsia-600 to-amber-600 bg-clip-text text-transparent">
                @aims_medical
              </span>
            </div>
            <h2 className="media-ig-text text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1.5 sm:mb-2">
              Follow Our <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">Campus Life</span>
            </h2>
            <p className="media-ig-text text-slate-600 text-xs sm:text-base leading-relaxed mb-3 sm:mb-5 line-clamp-2 sm:line-clamp-none">
              Experience the campus energy at AIMS Salipur through student highlights, practical sessions, and cultural events.
            </p>

            <div className="relative">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {instagramImages.map((src, i) => {
                  const igSrc = frontendImages[`instagram_${i + 1}`] || src;

                  return (
                    <a
                      key={i}
                      href="https://instagram.com/aims_medical"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-sm ${
                        i === 0 ? "md:row-span-2 aspect-square md:aspect-auto md:h-full" : "aspect-square"
                      }`}
                    >
                      <Image
                        src={igSrc}
                        alt={`AIMS Campus Life ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={igSrc.startsWith("data:")}
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                      <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow mb-1">
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                      </div>
                      <div className="text-white text-[10px] sm:text-xs font-bold drop-shadow">
                        View Post
                      </div>
                    </div>
                  </a>
                );
              })}
              </div>

              {/* Follow CTA */}
              <a
                href="https://instagram.com/aims_medical"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 sm:mt-5 flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-500 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-xs sm:text-sm font-bold"
              >
                <Instagram className="h-4 w-4" />
                <span>Follow @aims_medical</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
