"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { CoursePosterBanner } from "@/components/ui/course-poster-banner";
import { subscribeToDataRefresh } from "@/lib/refresh-event";
import gsap from "gsap";

const categoryMap: Record<string, { label: string; variant: "default" | "warning" | "secondary" | "success" }> = {
  Recruitment: { label: "Recruitment", variant: "default" },
  Entrance: { label: "Entrance", variant: "warning" },
  Lecturer: { label: "Lecturer", variant: "secondary" },
  "International (UAE)": { label: "International (UAE)", variant: "success" },
};

const courseInfo: Record<string, { category: string; duration: string }> = {
  "OSSSC Nursing Officer Exam Coaching": { category: "Recruitment", duration: "4-5 Mo" },
  "AIIMS NORCET Coaching": { category: "Recruitment", duration: "6 Mo" },
  "ESIC Nursing Officer Coaching": { category: "Recruitment", duration: "5 Mo" },
  "MNS Entrance Exam Prep": { category: "Entrance", duration: "4 Mo" },
  "RRB Railway Nursing Superintendent Prep": { category: "Recruitment", duration: "5 Mo" },
  "OJEE Nursing Entrance Prep": { category: "Entrance", duration: "3-4 Mo" },
  "Nursing Lecturer & Tutor Prep": { category: "Lecturer", duration: "6 Mo" },
  "HAAD / DOH Abu Dhabi Nursing Exam": { category: "International (UAE)", duration: "3-4 Mo" },
  "DSSSB Nursing Officer Exam Coaching": { category: "Recruitment", duration: "4-5 Mo" },
  "JIPMER Nursing Officer & Entrance Exam": { category: "Recruitment", duration: "4-5 Mo" },
  "PGIMER Chandigarh Nursing Officer & Entrance": { category: "Recruitment", duration: "4-5 Mo" },
  "CHO (Community Health Officer) Coaching": { category: "Recruitment", duration: "3-4 Mo" },
  "NEET Entrance 2026 - Latest Pattern Updated": { category: "Entrance", duration: "1-2 Yrs" },
  "OSSSC MPHW (Multipurpose Health Worker) Entrance / Recruitment Exam": { category: "Recruitment", duration: "4-5 Mo" },
};

// Dynamic helper: Automatically resolves category, badge variant, and duration for ANY course (existing or newly added)
function getCourseMetadata(course: { title: string; description?: string }) {
  const title = (course.title || "").toLowerCase();
  const desc = (course.description || "").toLowerCase();

  // 1. Direct match in courseInfo table
  if (courseInfo[course.title]) {
    const staticInfo = courseInfo[course.title];
    return {
      category: staticInfo.category,
      duration: staticInfo.duration,
      catBadge: categoryMap[staticInfo.category] || { label: staticInfo.category, variant: "default" as const },
    };
  }

  // 2. Dynamic Category Inference for newly created courses
  let category = "Recruitment";
  let variant: "default" | "warning" | "secondary" | "success" = "default";

  if (
    title.includes("international") ||
    title.includes("haad") ||
    title.includes("doh") ||
    title.includes("dha") ||
    title.includes("nclex") ||
    title.includes("uae") ||
    title.includes("dubai")
  ) {
    category = "International (UAE)";
    variant = "success";
  } else if (
    title.includes("lecturer") ||
    title.includes("tutor") ||
    title.includes("faculty") ||
    title.includes("professor") ||
    title.includes("msc")
  ) {
    category = "Lecturer";
    variant = "secondary";
  } else if (
    title.includes("entrance") ||
    title.includes("neet") ||
    title.includes("ojee") ||
    title.includes("mns") ||
    title.includes("b.sc") ||
    title.includes("bsc") ||
    title.includes("admission")
  ) {
    category = "Entrance";
    variant = "warning";
  } else {
    category = "Recruitment";
    variant = "default";
  }

  // 3. Dynamic Duration Inference
  let duration = "4-5 Mo";
  if (title.includes("neet") || desc.includes("neet")) {
    duration = "1-2 Yrs";
  } else if (title.includes("norcet") || title.includes("lecturer")) {
    duration = "6 Mo";
  } else if (title.includes("cho") || title.includes("ojee") || title.includes("haad")) {
    duration = "3-4 Mo";
  } else if (desc.includes("mo") || desc.includes("month")) {
    const match = desc.match(/(\d+[-–]?\d*\s*(?:months?|mo))/i);
    if (match) duration = match[1].replace(/months?/i, "Mo").trim();
  }

  return {
    category,
    duration,
    catBadge: { label: category, variant },
  };
}

// Generates consistent, realistic seat count for any course ID
function getSeatsForCourse(id: string, title: string) {
  const combined = (id || "") + (title || "");
  const hash = combined.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 24 + (hash % 26); // realistic seat count between 24 and 49
}

const fallbackCourses = [
  {
    id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
    title: "OSSSC Nursing Officer Exam Coaching",
    description: "Exclusively designed preparation course for the OSSSC Nursing Officer recruitment exam, covering core GNM/B.Sc. Nursing subjects, Arithmetic, Reasoning, General English, Odisha GK, and Computer basics.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2",
    title: "AIIMS NORCET Coaching",
    description: "High-yield preparation program for the Nursing Officer Recruitment Common Eligibility Test (NORCET) conducted by AIIMS New Delhi, featuring comprehensive CBT practice across general aptitude and nursing streams.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "ESIC Nursing Officer Coaching",
    description: "Complete preparation for the Employees' State Insurance Corporation (ESIC) Nursing Officer CBT exam, targeting core GNM/B.Sc. nursing topics and general aptitude sections.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4",
    title: "MNS Entrance Exam Prep",
    description: "Specialized training for the Military Nursing Service (MNS) B.Sc. Nursing entrance exam, including General Intelligence, English, Biology, Physics, and Chemistry.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5",
    title: "RRB Railway Nursing Superintendent Prep",
    description: "Targeted coaching for Railway Recruitment Board (RRB) Staff Nurse & Nursing Superintendent vacancies with comprehensive CBT practice and mock tests.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6",
    title: "OJEE Nursing Entrance Prep",
    description: "Preparation for Odisha Joint Entrance Examination (OJEE) Nursing streams, covering ANM, GNM, Basic B.Sc. Nursing, Post Basic B.Sc. Nursing, and M.Sc. Nursing entrance exams.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7",
    title: "Nursing Lecturer & Tutor Prep",
    description: "Advanced coaching for Nursing Faculty & Tutor recruitments in government and private nursing colleges with pedagogy and clinical expertise modules.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9",
    title: "HAAD / DOH Abu Dhabi Nursing Exam",
    description: "Specialized coaching for the DOH (Department of Health Abu Dhabi / HAAD) Exam. 150 clinical scenario MCQs, Pearson VUE CBT pattern covering Adult Nursing, Fundamentals, Pharmacology, Maternal-Child, and UAE healthcare protocols.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "ca10ca10-ca10-ca10-ca10-ca10ca10ca10",
    title: "DSSSB Nursing Officer Exam Coaching",
    description: "Comprehensive preparation for Delhi Govt Hospitals (GNCTD) Staff Nurse / Nursing Officer recruitment. 200 Questions, 200 Marks with Section A (General Aptitude, Hindi, English) and Section B (100 Marks Technical Nursing).",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "cb11cb11-cb11-cb11-cb11-cb11cb11cb11",
    title: "JIPMER Nursing Officer & Entrance Exam",
    description: "High-yield preparation for JIPMER Puducherry Nursing Officer CBT (100 Qs / 400 Marks, +4/-1) and JIPMER B.Sc. Nursing Entrance admission examinations.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "cc12cc12-cc12-cc12-cc12-cc12cc12cc12",
    title: "PGIMER Chandigarh Nursing Officer & Entrance",
    description: "Focused preparation for PGIMER Chandigarh Nursing Officer recruitment (100 Qs / 90 Min, -0.25 Negative) as well as B.Sc (Hons.) Nursing and Post-Basic Nursing entrance.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "cd13cd13-cd13-cd13-cd13-cd13cd13cd13",
    title: "CHO (Community Health Officer) Coaching",
    description: "Complete preparation for NHM Community Health Officer (Ayushman Arogya Mandir / HWC) recruitment across Odisha, Bihar, UP & Rajasthan, plus CCH/IGNOU certification.",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "ce14ce14-ce14-ce14-ce14-ce14ce14ce14",
    title: "NEET Entrance 2026 - Latest Pattern Updated",
    description: "NEET UG for B.Sc. Nursing in government medical colleges (180 Compulsory MCQs, 720 Marks with Physics, Chemistry, Biology - Botany & Zoology).",
    instructor: { full_name: "Sahil Sahoo" },
  },
  {
    id: "cf15cf15-cf15-cf15-cf15-cf15cf15cf15",
    title: "OSSSC MPHW (Multipurpose Health Worker) Entrance / Recruitment Exam",
    description: "100 Marks CBRT/OMR Exam covering ANM syllabus (Community Health Nursing, Midwifery, Child Health), practical skills & arithmetic.",
    instructor: { full_name: "Sahil Sahoo" },
  },
];

export function CoursesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [coursesList, setCoursesList] = useState<any[]>(fallbackCourses);
  const frontendImages = useFrontendImages();

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        // Cache-busting fetch ensures new courses added via admin/instructor immediately appear
        const res = await fetch("/api/courses?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (
            isMounted &&
            data.courses &&
            Array.isArray(data.courses) &&
            data.courses.length > 0
          ) {
            setCoursesList(data.courses);
          }
        }
      } catch (err) {
        console.error("Error fetching live courses for landing page:", err);
      }
    }

    loadCourses();

    // Auto-refresh when courses are created/edited in admin or instructor portal
    const unsubscribe = subscribeToDataRefresh(() => {
      loadCourses();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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
      stagger: 0.05,
      duration: 0.5,
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
        {/* Header */}
        <div className="courses-header flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-6 mb-6 sm:mb-10 md:mb-14">
          <div className="max-w-2xl">
            <div className="courses-text-reveal inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-aims-green/10 mb-2.5 sm:mb-4">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-aims-green" />
              <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-aims-green">
                Featured Programs ({coursesList.length})
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

        {/* 2 Courses per line on Mobile/Tablet, 3 on Desktop */}
        <div className="courses-grid grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {coursesList.map((course, i) => {
            const meta = getCourseMetadata(course);
            const seats = getSeatsForCourse(course.id, course.title);
            const rawThumb = (
              course.thumbnail_url ||
              frontendImages[`course_${course.id}`] ||
              frontendImages[`course_${i + 1}`] ||
              ""
            ).trim();

            return (
              <Card
                key={course.id || i}
                className="course-card-item group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col bg-white rounded-xl sm:rounded-2xl"
              >
                {/* Thumbnail / Branded Visual with Aspect Ratio */}
                <div className="relative overflow-hidden aspect-[16/11]">
                  <CoursePosterBanner
                    title={course.title}
                    thumbnailUrl={rawThumb}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
                    <Badge
                      variant={meta.catBadge.variant}
                      className="text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 shadow"
                    >
                      {meta.catBadge.label}
                    </Badge>
                  </div>

                  {/* Duration & Seats */}
                  <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2.5 sm:left-3 sm:right-3 flex items-center justify-between text-white text-[10px] sm:text-xs font-semibold drop-shadow z-20">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{meta.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{seats} Seats</span>
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
                        alt={`${course.instructor?.full_name || "Faculty Mentor"} - AIMS Salipur`}
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
                    <Link
                      href={`/signup?course=${encodeURIComponent(course.title)}`}
                      aria-label={`Apply for ${course.title} at AIMS Salipur`}
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Compact Help Banner */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 inline-block max-w-xl w-full border border-slate-200/80 shadow-md">
            <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 mb-1">
              Can&apos;t find your desired exam program?
            </h3>
            <p className="text-slate-500 text-[11px] sm:text-xs mb-3 sm:mb-4 max-w-sm mx-auto leading-relaxed">
              Speak with our senior admission mentors for customized batch guidance tailored to your syllabus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <a
                href="https://wa.me/918480405956"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="sm"
                  className="w-full sm:w-auto h-8 sm:h-9 px-4 gap-1.5 text-xs font-bold bg-aims-navy hover:bg-aims-navy/90 text-white"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Office Helpline: +91 84804 05956
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
