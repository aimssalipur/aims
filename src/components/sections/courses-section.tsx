"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dummyCourses } from "@/lib/dummy-data";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Users,
  PlayCircle,
} from "lucide-react";
import { initials as getInitials } from "@/lib/utils";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useFrontendImages } from "@/lib/frontend-images";
import gsap from "gsap";

const categoryMap: Record<string, { label: string; variant: any }> = {
  Recruitment: { label: "Recruitment", variant: "default" },
  Entrance: { label: "Entrance", variant: "warning" },
  Lecturer: { label: "Lecturer", variant: "secondary" },
};

const courseInfo: Record<string, { category: string; duration: string }> = {
  "OSSSC Nursing Officer Exam Coaching": { category: "Recruitment", duration: "4-5 Mo" },
  "AIIMS NORCET Coaching": { category: "Recruitment", duration: "6 Mo" },
  "ESIC Nursing Officer Coaching": { category: "Recruitment", duration: "5 Mo" },
  "MNS Entrance Exam Prep": { category: "Entrance", duration: "4 Mo" },
  "RRB Railway Nursing Superintendent Prep": { category: "Recruitment", duration: "5 Mo" },
  "OJEE Nursing Entrance Prep": { category: "Entrance", duration: "3-4 Mo" },
  "Nursing Lecturer & Tutor Prep": { category: "Lecturer", duration: "6 Mo" },
};

export function CoursesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuredCourses = dummyCourses;
  const frontendImages = useFrontendImages();

  useGSAP(() => {
    gsap.from(".courses-text-reveal", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".courses-header",
        start: "top 85%",
      },
    });

    gsap.from(".course-card-item", {
      y: 25,
      opacity: 0,
      stagger: 0.06,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".courses-grid",
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      id="courses"
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-aims-navy/[0.015] to-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-aims-green/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-aims-navy/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-1 sm:px-6 relative">
        {/* Compact Header for Fast Scanning on Mobile */}
        <div className="courses-header flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-6 mb-6 sm:mb-10 md:mb-14">
          <div className="max-w-2xl">
            <div className="courses-text-reveal inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-aims-green/10 mb-2.5 sm:mb-4">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-aims-green" />
              <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-aims-green">
                Featured Programs
              </span>
            </div>
            <h2 className="courses-text-reveal text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              World-Class Programs
              <br />
              <span className="gradient-text">Designed for Your Future</span>
            </h2>
          </div>
          <p className="courses-text-reveal md:max-w-sm text-slate-600 text-xs sm:text-base leading-relaxed">
            Prepare for top government nursing recruitments with comprehensive
            syllabus coverage, weekly mock series, and mentorship.
          </p>
        </div>

        {/* 2 Courses per line on Mobile and Tablet, 3 on Desktop */}
        <div className="courses-grid grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {featuredCourses.map((course, i) => {
            const info = courseInfo[course.title] || { category: "Nursing", duration: "2 Yrs" };
            const cat = categoryMap[info.category] || { label: "Recruitment", variant: "default" };
            const courseThumb = frontendImages[`course_${i + 1}`] || course.thumbnail_url;

            return (
              <Card
                key={course.id}
                className="course-card-item group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col bg-white rounded-xl sm:rounded-2xl"
              >
                {/* Thumbnail Image with Aspect Ratio */}
                <div className="relative overflow-hidden aspect-[16/11]">
                  <Image
                    src={courseThumb}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={courseThumb.startsWith("data:")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <Badge
                      variant={cat.variant}
                      className="text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 shadow"
                    >
                      {cat.label}
                    </Badge>
                  </div>

                  {/* Duration & Seats */}
                  <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2.5 sm:left-3 sm:right-3 flex items-center justify-between text-white text-[10px] sm:text-xs font-semibold drop-shadow">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{info.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{20 + ((parseInt(course.id.slice(1)) || 1) * 7) % 30} Seats</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="flex-1 p-2.5 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 leading-snug mb-1 sm:mb-1.5 line-clamp-2 group-hover:text-aims-navy transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-[10px] sm:text-xs line-clamp-2 leading-tight sm:leading-relaxed mb-2.5">
                      {course.description}
                    </p>
                  </div>

                  {/* Mentor */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2">
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 ring-1 ring-white shadow-xs shrink-0">
                      <AvatarImage
                        src={course.instructor?.avatar_url || ""}
                        alt={course.instructor?.full_name || ""}
                      />
                      <AvatarFallback className="text-[9px] sm:text-[10px] font-bold bg-emerald-700 text-white">
                        {getInitials(course.instructor?.full_name || "Faculty")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-none">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">
                        {course.instructor?.full_name || "Faculty"}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                        Exam Mentor
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Action Button */}
                <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full h-8 sm:h-9 text-[11px] sm:text-xs font-bold gap-1 rounded-lg sm:rounded-xl hover:bg-aims-navy hover:text-white transition-all shadow-xs px-2"
                    asChild
                  >
                    <Link href="/signup">
                      <span>Apply Now</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Compact Mobile-Friendly CTA Banner */}
        <div className="mt-6 sm:mt-12 text-center">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-6 md:p-8 inline-block max-w-xl w-full border border-slate-200/80 shadow-md">
            <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 mb-1">
              Can&apos;t find your desired exam program?
            </h3>
            <p className="text-slate-500 text-[11px] sm:text-xs mb-3 sm:mb-4 max-w-sm mx-auto leading-relaxed">
              Speak with our senior admission mentors for customized batch guidance tailored to your syllabus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <a
                href="https://wa.me/919437959054"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto h-8 sm:h-9 px-4 gap-1.5 text-xs font-bold shadow-sm"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Free Counseling
                </Button>
              </a>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-8 sm:h-9 px-4 gap-1 text-xs font-bold"
                >
                  View All Batches
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
