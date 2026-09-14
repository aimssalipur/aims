"use client";

import { useRef } from "react";
import {
  BookOpenCheck,
  HeartHandshake,
  ShieldCheck,
  Users,
  Microscope,
  Award,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGSAP } from "@/lib/use-gsap-animation";
import gsap from "gsap";

const values = [
  {
    icon: BookOpenCheck,
    title: "Knowledge",
    description:
      "Rigorous academic curriculum with contemporary healthcare standards and evidence-based learning.",
    color: "text-aims-navy",
    bg: "bg-aims-navy",
    softBg: "bg-aims-navy/10",
    gradient: "from-aims-navy to-blue-600",
  },
  {
    icon: HeartHandshake,
    title: "Compassion",
    description:
      "Cultivating empathy, emotional intelligence, and patient-centered care in every clinical practice.",
    color: "text-rose-600",
    bg: "bg-rose-600",
    softBg: "bg-rose-100",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: ShieldCheck,
    title: "Care Excellence",
    description:
      "Highest standards of clinical excellence with ethical integrity and quality assurance protocols.",
    color: "text-aims-green",
    bg: "bg-aims-green",
    softBg: "bg-aims-green/10",
    gradient: "from-aims-green to-emerald-600",
  },
  {
    icon: Users,
    title: "Mentorship",
    description:
      "One-on-one faculty guidance, clinical preceptors, and pastoral care for holistic career growth.",
    color: "text-purple-600",
    bg: "bg-purple-600",
    softBg: "bg-purple-100",
    gradient: "from-purple-600 to-violet-600",
  },
  {
    icon: Microscope,
    title: "Innovation",
    description:
      "Modern simulation labs, digital learning platforms, and exposure to advanced medical practices.",
    color: "text-amber-600",
    bg: "bg-amber-500",
    softBg: "bg-amber-100",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Stethoscope,
    title: "Clinical Exposure",
    description:
      "Partnerships with top-tier hospitals for real-world clinical rotations and health camps.",
    color: "text-sky-600",
    bg: "bg-sky-600",
    softBg: "bg-sky-100",
    gradient: "from-sky-600 to-blue-500",
  },
];

export function ValuesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".value-text-reveal", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".value-header",
        start: "top 85%",
      },
    });

    gsap.from(".value-card", {
      y: 25,
      opacity: 0,
      stagger: 0.06,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".values-grid",
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/40"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-aims-navy/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-aims-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-1 sm:px-6 relative">
        {/* Compact Header on Mobile to minimize scrolling */}
        <div className="value-header text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-14">
          <div className="value-text-reveal inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-aims-navy/10 mb-2.5 sm:mb-4">
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-aims-navy" />
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-aims-navy">
              Our Core Values
            </span>
          </div>
          <h2 className="value-text-reveal text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Built on the Pillars of{" "}
            <span className="gradient-text">Excellence</span>
          </h2>
          <p className="value-text-reveal mt-2 sm:mt-3 text-xs sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Every lecture, mock test, and mentoring session at AIMS is built around
            these core pillars to ensure our students excel in competitive exams.
          </p>
        </div>

        {/* 2 Tiles per line on Mobile and Tablet, 3 on Desktop */}
        <div className="values-grid grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card
                key={value.title}
                className="value-card group relative overflow-hidden border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-xl sm:rounded-2xl"
              >
                {/* Gradient top accent */}
                <div
                  className={`h-1 sm:h-1.5 w-full bg-gradient-to-r ${value.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <CardContent className="p-3 sm:p-5 md:p-6 flex flex-col h-full">
                  <div
                    className={`h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${value.softBg} ${value.color} flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0`}
                  >
                    <Icon className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-xs sm:text-base md:text-lg font-extrabold text-slate-900 mb-1 sm:mb-1.5 flex items-center gap-1.5">
                    <span className="truncate">{value.title}</span>
                    <div
                      className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${value.bg} opacity-60 shrink-0`}
                    />
                  </h3>
                  <p className="text-slate-600 leading-snug sm:leading-relaxed text-[11px] sm:text-xs md:text-sm line-clamp-3 sm:line-clamp-none">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
