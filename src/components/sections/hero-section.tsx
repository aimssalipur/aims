"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  UserPlus,
  ArrowRight,
  PlayCircle,
  Star,
  Award,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useFrontendImage } from "@/lib/frontend-images";
import gsap from "gsap";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImage = useFrontendImage(
    "hero_main",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80"
  );

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-badge", {
      y: -15,
      opacity: 0,
      duration: 0.5,
    })
      .from(
        ".hero-title",
        {
          y: 25,
          opacity: 0,
          duration: 0.7,
        },
        "-=0.3"
      )
      .from(
        ".hero-desc",
        {
          y: 18,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.4"
      )
      .from(
        ".hero-stat-item",
        {
          y: 15,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
        },
        "-=0.3"
      )
      .from(
        ".hero-cta-btn",
        {
          y: 12,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
        },
        "-=0.2"
      )
      .from(
        ".hero-trust",
        {
          opacity: 0,
          duration: 0.5,
        },
        "-=0.2"
      )
      .from(
        ".hero-visual",
        {
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.6"
      );
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative overflow-hidden hero-gradient pt-4 pb-12 sm:pt-8 sm:pb-20 md:pt-14 md:pb-28"
    >
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 bg-aims-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 sm:w-[28rem] h-72 sm:h-[28rem] bg-aims-navy/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-aims-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1E3A8A 1px, transparent 1px), linear-gradient(90deg, #1E3A8A 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left content */}
          <div className="lg:col-span-7 relative z-10">
            {/* Top pill badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur border border-aims-navy/10 shadow-sm mb-4 sm:mb-6">
              <GraduationCap className="h-4 w-4 text-aims-green" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Odisha&apos;s #1 Nursing Recruitment Academy
              </span>
            </div>

            {/* Fluid Hero Headline */}
            <h1 className="hero-title text-[clamp(2.1rem,6vw,4.25rem)] font-black tracking-tight text-slate-900 leading-[1.08]">
              Empowering{" "}
              <span className="gradient-text">Healthcare</span>
              <br className="hidden sm:block" /> Leaders through{" "}
              <span className="relative inline-block">
                <span className="relative z-10 gradient-text">Knowledge</span>
                <span className="absolute -bottom-1 left-0 w-full h-2.5 bg-aims-gold/25 -z-10 rounded-full" />
              </span>
              <span className="text-aims-navy">,</span>
              <br className="hidden sm:block" /> Compassion &amp; Care.
            </h1>

            <p className="hero-desc mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              AIMS Salipur delivers premier, syllabus-targeted coaching for OSSSC
              Nursing Officer, AIIMS NORCET, ESIC, MNS, and RRB recruitments. Join
              Odisha&apos;s most trusted mentors and secure your government nursing career.
            </p>

            {/* Stats strip */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg">
              {[
                {
                  label: "Success Stories",
                  value: "5000+",
                  icon: GraduationCap,
                  color: "text-aims-navy",
                  bg: "bg-aims-navy/10",
                },
                {
                  label: "Specialist Mentors",
                  value: "15+",
                  icon: Award,
                  color: "text-aims-green",
                  bg: "bg-aims-green/10",
                },
                {
                  label: "Exam Batches",
                  value: "7+",
                  icon: BookOpen,
                  color: "text-amber-600",
                  bg: "bg-amber-100",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="hero-stat-item p-2.5 sm:p-3 rounded-2xl bg-white/70 backdrop-blur border border-slate-100/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/signup" className="hero-cta-btn sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto px-6 h-12 gap-2 group text-sm font-bold shadow-lg shadow-aims-navy/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Apply for Admission
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="#courses" className="hero-cta-btn sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-6 h-12 gap-2 group text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  Explore Courses
                </Button>
              </Link>

              <a
                href="#media"
                className="hero-cta-btn inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:text-aims-navy transition-colors group cursor-pointer"
              >
                <PlayCircle className="h-5 w-5 text-aims-green transition-transform group-hover:scale-110" />
                Watch Campus Tour
              </a>
            </div>

            {/* Trust rating badge */}
            <div className="hero-trust mt-6 sm:mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
                ].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt="Student"
                    width={36}
                    height={36}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white shadow-md object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-0.5">
                  <span className="text-slate-900 font-extrabold">4.9/5 Rating</span> · Loved by 500+ students
                </div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="hero-visual lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating card - top */}
              <div
                className="absolute -top-4 -left-2 sm:-top-6 sm:-left-4 z-20 w-48 sm:w-56 glass-card rounded-2xl p-3 sm:p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-aims-green/15 text-aims-green flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                      Result Oriented
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Full Syllabus Covered
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - bottom */}
              <div
                className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-2 z-20 w-52 sm:w-64 glass-card rounded-2xl p-3 sm:p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-aims-navy/15 text-aims-navy flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                      Success Rate
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      90% Exam Selection Rate
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 sm:mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[95%] bg-aims-gradient rounded-full" />
                </div>
              </div>

              {/* Main image container */}
              <div className="relative rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white border border-white/60">
                <div className="relative aspect-[4/3] sm:aspect-[4/5] bg-gradient-to-br from-aims-navy/5 via-aims-green/5 to-aims-gold/5">
                  <Image
                    src={heroImage}
                    alt="AIMS Nursing Candidates in Exam Prep Lab"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                    unoptimized={heroImage.startsWith("data:")}
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aims-navy/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
                      Coaching Excellence
                    </div>
                    <div className="text-base sm:text-xl font-extrabold leading-tight">
                      Odisha&apos;s Top Nursing Officer Academy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
