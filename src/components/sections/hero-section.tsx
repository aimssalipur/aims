"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  UserPlus,
  ArrowRight,
  Award,
  GraduationCap,
  CheckCircle2,
  Phone,
  MessageCircle,
  Check,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useToast } from "@/components/ui/use-toast";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";
import gsap from "gsap";

const defaultCourses = [
  "OSSSC Nursing Officer Exam Coaching",
  "AIIMS NORCET Coaching",
  "ESIC Nursing Officer Coaching",
  "MNS Entrance Exam Prep",
  "RRB Railway Nursing Superintendent Prep",
  "OJEE Nursing Entrance Prep",
  "Nursing Lecturer & Tutor Prep",
  "HAAD / DOH Abu Dhabi Nursing Exam",
  "DSSSB Nursing Officer Exam Coaching",
  "JIPMER Nursing Officer & Entrance Exam",
  "PGIMER Chandigarh Nursing Officer & Entrance",
  "CHO (Community Health Officer) Coaching",
  "NEET Entrance 2026 - Latest Pattern Updated",
  "OSSSC MPHW (Multipurpose Health Worker) Exam",
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [courses, setCourses] = useState<string[]>(defaultCourses);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    defaultCourses[0],
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamically load active courses from backend
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (
            isMounted &&
            data.courses &&
            Array.isArray(data.courses) &&
            data.courses.length > 0
          ) {
            const titles = data.courses
              .map((c: any) => c.title)
              .filter(Boolean);
            if (titles.length > 0) {
              setCourses(titles);
            }
          }
        }
      } catch {
        // use default fallback courses
      }
    }
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCourse = (courseTitle: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseTitle)
        ? prev.filter((c) => c !== courseTitle)
        : [...prev, courseTitle]
    );
  };

  const handleQuickApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = form.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      toast({
        title: "Valid mobile required",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCourses.length === 0) {
      toast({
        title: "Course selection required",
        description: "Please select at least one course to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const coursesString = selectedCourses.join(", ");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: cleanPhone,
          course: coursesString,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok && data.error && !data.error.includes("already registered")) {
        toast({
          title: "Application notice",
          description: getFriendlyErrorMessage(data.error),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: `Thank you, ${form.fullName}! Connecting you with AIMS office on WhatsApp...`,
      });

      const whatsappMessage = `Hello AIMS Salipur Admissions,

I have submitted an online application for course enrollment:

• Candidate Name: ${form.fullName.trim()}
• Mobile Number: ${cleanPhone}
• Email: ${form.email.trim().toLowerCase()}
• Selected Course(s): ${coursesString}

Please share batch schedule, admission confirmation, and fee details. Thank you!`;

      const whatsappUrl = `https://wa.me/918480405956?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 700);
    } catch {
      setIsSubmitted(true);
      const whatsappMessage = `Hello AIMS Salipur Office,

I want to apply for: ${coursesString}.
• Name: ${form.fullName}
• Phone: ${cleanPhone}`;
      const whatsappUrl = `https://wa.me/918480405956?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappUrl, "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        ".hero-visual",
        {
          scale: 0.98,
          opacity: 0,
          duration: 0.7,
        },
        "-=0.3"
      );
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative overflow-x-clip hero-gradient pt-4 pb-10 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20 w-full max-w-full"
    >
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-aims-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 sm:w-[28rem] h-64 sm:h-[28rem] bg-aims-navy/10 rounded-full blur-3xl" />
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

      <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start w-full min-w-0">
          {/* Left content */}
          <div className="lg:col-span-7 relative z-10 pt-1 sm:pt-2 w-full min-w-0">
            {/* Top pill badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs mb-3.5 sm:mb-6 max-w-full">
              <GraduationCap className="h-4 w-4 text-aims-green shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-700 truncate">
                Odisha&apos;s Dedicated Nursing Recruitment Academy
              </span>
            </div>

            {/* Fluid Hero Headline */}
            <h1 className="hero-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-900 leading-[1.15] break-words">
              Empowering <span className="gradient-text">Healthcare</span>
              <br className="hidden sm:block" /> Leaders through Knowledge,
              <br className="hidden sm:block" /> Compassion &amp; Care.
            </h1>

            <p className="hero-desc mt-3 sm:mt-5 text-xs sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              AIMS Salipur delivers syllabus-targeted coaching for OSSSC Nursing
              Officer, AIIMS NORCET, ESIC, MNS, and RRB recruitments with
              dedicated faculty guidance and rigorous CBT mock test series.
            </p>

            {/* Stats strip */}
            <div className="mt-5 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg w-full">
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
                  label: "Active Batches",
                  value: "14+",
                  icon: BookOpen,
                  color: "text-amber-700",
                  bg: "bg-amber-100",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="hero-stat-item p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left min-w-0"
                  >
                    <div
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 w-full">
                      <div className="text-sm sm:text-xl font-extrabold text-slate-900 leading-tight">
                        {stat.value}
                      </div>
                      <div className="text-[9px] sm:text-xs font-medium text-slate-500 truncate mt-0.5 w-full">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <a href="#quick-apply" className="hero-cta-btn w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-7 h-11 sm:h-12 gap-2 text-xs sm:text-sm font-bold bg-aims-navy hover:bg-aims-navy/90 text-white rounded-xl shadow-md"
                >
                  <UserPlus className="h-4 w-4 shrink-0" />
                  <span>Apply for Admission</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </a>

              <Link href="#courses" className="hero-cta-btn w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-5 sm:px-6 h-11 sm:h-12 gap-2 text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 border-slate-300 text-slate-800 rounded-xl"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>View All Courses</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side: Student Admission & Multi-Course Enrollment Card */}
          <div
            id="quick-apply"
            className="hero-visual lg:col-span-5 relative mt-6 lg:mt-0 w-full min-w-0 scroll-mt-20 sm:scroll-mt-24"
          >
            <div className="relative mx-auto w-full max-w-md lg:max-w-none min-w-0">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 lg:p-7 w-full min-w-0 overflow-hidden box-border">
                {/* Header */}
                <div className="border-b border-slate-100 pb-3 mb-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-aims-navy">
                      Admissions Desk
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Open for Enrollment
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    Course Admission Form
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select one or more courses and enter your details to apply.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Application Submitted Successfully
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                      Thank you! We have received your application for:
                    </p>
                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 text-left border border-slate-200 max-h-28 overflow-y-auto">
                      <ul className="list-disc pl-4 space-y-0.5">
                        {selectedCourses.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/918480405956?text=${encodeURIComponent(
                          `Hello AIMS Office, I have submitted an admission application for ${selectedCourses.join(
                            ", "
                          )}. Candidate: ${form.fullName}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat with Office on WhatsApp
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setForm({ fullName: "", phone: "", email: "" });
                        setSelectedCourses([courses[0] || defaultCourses[0]]);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-medium pt-1"
                    >
                      Submit another application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickApply} className="space-y-3 sm:space-y-3.5 w-full min-w-0">
                    {/* Full Name */}
                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        className="w-full h-10 text-xs sm:text-sm bg-white border-slate-300 focus:border-aims-navy rounded-lg"
                        required
                      />
                    </div>

                    {/* WhatsApp & Email in 2 columns on tablet+, stacked on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          WhatsApp Mobile <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full min-w-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                            +91
                          </span>
                          <Input
                            type="tel"
                            placeholder="10-digit number"
                            value={form.phone}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                phone: e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 10),
                              })
                            }
                            className="w-full pl-10 h-10 text-xs sm:text-sm bg-white border-slate-300 focus:border-aims-navy rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="name@email.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="w-full h-10 text-xs sm:text-sm bg-white border-slate-300 focus:border-aims-navy rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    {/* Multiple Course Selection */}
                    <div className="w-full min-w-0">
                      <div className="flex items-center justify-between mb-1.5 gap-2 min-w-0">
                        <label className="text-xs font-semibold text-slate-700 shrink-0">
                          Select Course(s) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] sm:text-[11px] font-bold text-aims-navy bg-aims-navy/10 px-2 py-0.5 rounded shrink-0 max-w-[140px] truncate">
                          {selectedCourses.length === 0
                            ? "Select at least 1"
                            : `${selectedCourses.length} course${
                                selectedCourses.length > 1 ? "s" : ""
                              } selected`}
                        </span>
                      </div>

                      {/* Course checklist chips container with explicit flex item constraints */}
                      <div className="max-h-44 sm:max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-1.5 sm:p-2 bg-slate-50/50 w-full min-w-0">
                        {courses.map((course) => {
                          const isSelected = selectedCourses.includes(course);
                          return (
                            <button
                              key={course}
                              type="button"
                              onClick={() => toggleCourse(course)}
                              className={`w-full min-w-0 text-left px-2.5 py-1.5 sm:py-2 rounded-md text-xs transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-aims-navy text-white font-semibold shadow-xs"
                                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-normal"
                              }`}
                            >
                              <span className="truncate flex-1 min-w-0 text-left">{course}</span>
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 text-white shrink-0" />
                              ) : (
                                <span className="h-3.5 w-3.5 rounded border border-slate-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                        Tap any course above to add or remove it from your application.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 text-xs sm:text-sm font-bold bg-aims-navy hover:bg-aims-navy/90 text-white rounded-xl shadow-md transition-all mt-1"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <UserPlus className="h-4 w-4 shrink-0" />
                          <span>Submit Application</span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </span>
                      )}
                    </Button>

                    {/* Clean Footer Strip */}
                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Phone className="h-3.5 w-3.5 text-aims-navy" />
                        <span className="font-medium text-slate-600">Office Line:</span>
                      </div>
                      <a
                        href="tel:+918480405956"
                        className="font-bold text-slate-900 hover:text-aims-navy transition-colors shrink-0"
                      >
                        +91 84804 05956
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
