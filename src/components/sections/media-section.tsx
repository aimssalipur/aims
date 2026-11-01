"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ExternalLink,
  Instagram,
  Youtube,
  Camera,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useFrontendImages } from "@/lib/frontend-images";
import gsap from "gsap";

const AIMS_VIDEOS = [
  {
    id: "VIJWDvnelrA",
    title: "Nursing Competitive Exam Prep with AIMS",
    desc: "Admissions Open · Helpline: +91 94379 59054",
    badge: "Official Video",
  },
  {
    id: "1OuAlkKlDME",
    title: "AIMS Nursing Academy, Sisua, Salipur",
    desc: "Campus & Practical Guidance",
    badge: "Campus Tour",
  },
  {
    id: "tAg5qCrAwe0",
    title: "AIMS Nursing Coaching Institute",
    desc: "Salipur, Cuttack · Admission Updates",
    badge: "Institute Demo",
  },
];

const defaultCampusImages = [
  {
    url: "https://img.youtube.com/vi/1OuAlkKlDME/hqdefault.jpg",
    alt: "AIMS Salipur Campus & Classroom - Sisua, Salipur",
    caption: "Campus & Classes",
  },
  {
    url: "https://img.youtube.com/vi/tAg5qCrAwe0/hqdefault.jpg",
    alt: "AIMS Nursing Institute Salipur - Direct Admissions",
    caption: "Admissions Hub",
  },
  {
    url: "https://img.youtube.com/vi/72VCYc34MeA/hqdefault.jpg",
    alt: "AIMS Salipur Nursing Coaching Sessions",
    caption: "Exam Preparation",
  },
  {
    url: "https://img.youtube.com/vi/bGFM7PuZpBU/hqdefault.jpg",
    alt: "AIMS Salipur Practical Sessions & Highlights",
    caption: "Student Life",
  },
];

export function MediaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const frontendImages = useFrontendImages();
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentVideo = AIMS_VIDEOS[selectedVideo];

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
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&rel=0`}
                      title={currentVideo.title}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image
                        src={
                          selectedVideo === 0 && frontendImages.youtube_thumb
                            ? frontendImages.youtube_thumb
                            : `https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`
                        }
                        alt={currentVideo.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover opacity-85 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                      {/* Play button */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center group/btn"
                        aria-label={`Play ${currentVideo.title}`}
                      >
                        <div className="relative h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover/btn:bg-red-600 transition-all duration-300 group-hover/btn:scale-110">
                          <Play
                            className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 ml-1 group-hover/btn:text-white transition-colors"
                            fill="currentColor"
                          />
                        </div>
                      </button>

                      <div className="absolute bottom-2.5 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 flex items-end justify-between">
                        <div className="min-w-0 pr-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                            <span className="text-[10px] font-bold uppercase text-white tracking-wider">
                              {currentVideo.badge}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-white drop-shadow leading-tight line-clamp-2">
                            {currentVideo.title}
                          </h3>
                          <p className="text-white/80 text-[11px] sm:text-xs font-medium mt-0.5">
                            {currentVideo.desc}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Video switcher tabs */}
                <div className="p-2 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                  {AIMS_VIDEOS.map((vid, idx) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setSelectedVideo(idx);
                        setIsPlaying(true);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        selectedVideo === idx
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span className="truncate max-w-[120px] sm:max-w-[160px]">{vid.badge}</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 sm:p-4 flex items-center justify-between gap-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shrink-0">
                      <Youtube className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        @aimssalipur
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                        Official YouTube Channel · Salipur, Cuttack
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://youtube.com/@aimssalipur"
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
                @aimssalipur
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
                {defaultCampusImages.map((item, i) => {
                  const igSrc = frontendImages[`instagram_${i + 1}`] || item.url;

                  return (
                    <a
                      key={i}
                      href="https://www.instagram.com/aimssalipur/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-sm ${
                        i === 0 ? "md:row-span-2 aspect-square md:aspect-auto md:h-full" : "aspect-square"
                      }`}
                    >
                      <Image
                        src={igSrc}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-pink-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100 p-2 text-center">
                        <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow mb-1">
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                        </div>
                        <div className="text-white text-[11px] sm:text-xs font-extrabold drop-shadow">
                          {item.caption}
                        </div>
                        <div className="text-white/80 text-[9px] sm:text-[10px] font-semibold mt-0.5">
                          View on @aimssalipur
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Social Follow CTA (Instagram) */}
              <div className="mt-3 sm:mt-5">
                <a
                  href="https://www.instagram.com/aimssalipur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-500 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-xs sm:text-sm font-bold w-full"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Follow @aimssalipur on Instagram</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
