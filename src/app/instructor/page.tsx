"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { triggerDataRefresh, subscribeToDataRefresh } from "@/lib/refresh-event";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Video,
  Users,
  GraduationCap,
  MessageSquarePlus,
  TrendingUp,
  FileEdit,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  BookOpenCheck,
  Award,
  RotateCw,
  FileQuestion,
  Loader2,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import Link from "next/link";

export default function InstructorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, enrollRes, announceRes, examsRes] = await Promise.all([
        fetch("/api/courses", { cache: "no-store" }),
        fetch("/api/admin/enrollments", { cache: "no-store" }),
        fetch("/api/announcements", { cache: "no-store" }),
        fetch("/api/exams", { cache: "no-store" }),
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        if (cData.courses && Array.isArray(cData.courses)) {
          setCourses(cData.courses);
        }
      }

      if (enrollRes.ok) {
        const eData = await enrollRes.json();
        if (Array.isArray(eData)) {
          setEnrollments(eData);
        }
      }

      if (announceRes.ok) {
        const aData = await announceRes.json();
        if (Array.isArray(aData)) {
          setAnnouncements(aData);
        }
      }

      if (examsRes.ok) {
        const xData = await examsRes.json();
        if (xData.exams && Array.isArray(xData.exams)) {
          setExams(xData.exams);
        }
      }
    } catch (err) {
      console.error("Error fetching instructor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchDashboardData();
    });
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerDataRefresh();
    await fetchDashboardData();
    toast({
      title: "Faculty Portal Refreshed ✅",
      description: "Latest courses, enrollments, and examination data loaded.",
      variant: "success",
    });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const enrollmentCountByCourse: Record<string, number> = {};
  enrollments.forEach((e) => {
    if (e.course_id) {
      enrollmentCountByCourse[e.course_id] = (enrollmentCountByCourse[e.course_id] || 0) + 1;
    }
  });

  const uniqueStudents = new Set(enrollments.map((e) => e.student_id).filter(Boolean));

  const stats = [
    {
      label: "Active Courses",
      value: String(courses.length),
      sub: "Nursing Batches",
      icon: GraduationCap,
      gradient: "from-emerald-500 to-emerald-700",
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Total Enrollments",
      value: String(enrollments.length),
      sub: `${uniqueStudents.size} unique students`,
      icon: Users,
      gradient: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "MCQ Mock Exams",
      value: String(exams.length),
      sub: `${exams.filter((x) => x.is_published).length} Published`,
      icon: FileQuestion,
      gradient: "from-purple-500 to-violet-700",
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      label: "Announcements",
      value: String(announcements.length),
      sub: "Posted on Portal",
      icon: MessageSquarePlus,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-aims-green via-emerald-700 to-teal-800 text-white relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-72 h-72 bg-aims-navy/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative grid lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit text-[10px] sm:text-xs py-0.5 px-2 sm:px-2.5">
                <Award className="h-3 w-3 mr-1" /> Faculty Portal
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-8 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold border-white/20 gap-1.5 backdrop-blur transition-all shadow-xs"
                title="Refresh Faculty Portal (without page reload)"
              >
                <RotateCw className={cn("h-3.5 w-3.5 text-white shrink-0", isRefreshing && "animate-spin")} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </Button>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
              Welcome to AIMS Faculty Hub 👩‍⚕️
              <br />
              <span className="text-white/85 font-semibold text-sm sm:text-lg md:text-2xl">
                Manage nursing courses, online MCQ examinations, and student batches.
              </span>
            </h2>
            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-aims-green hover:bg-slate-50 gap-1.5 sm:gap-2 shadow-lg h-9 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm font-bold"
                asChild
              >
                <Link href="/instructor/exams">
                  <FileQuestion className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  Manage MCQ Exams
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur gap-1.5 sm:gap-2 h-9 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm font-bold"
                asChild
              >
                <Link href="/instructor/courses">
                  <FileEdit className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  Manage Courses
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-5 bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/15 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white/90 text-xs sm:text-sm">Platform Summary</span>
              <p className="text-xs text-white/70 mt-1">Live status of coaching batches & online tests</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">{courses.length}</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Live Courses
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">{enrollments.length}</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Enrollments
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">{exams.length}</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Online Tests
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">{announcements.length}</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Notices
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-3.5 sm:p-5 md:p-6 relative overflow-hidden">
                <div className="relative">
                  <div
                    className={cn(
                      "h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shadow-sm sm:shadow-md",
                      s.bg,
                      s.color
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.1} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-0.5 sm:mb-1 truncate">
                    {s.label}
                  </p>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-0.5 sm:mb-1">
                    {loading ? "—" : s.value}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-aims-green flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {s.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Active Courses */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Active Nursing Courses
              </h2>
              <p className="text-slate-500 mt-1">Real courses and student enrollment counts</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 font-bold" asChild>
              <Link href="/instructor/courses">
                <FileEdit className="h-4 w-4" />
                Manage All
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-aims-green" />
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-semibold">
                No active courses found. Create your first course in the courses section.
              </div>
            ) : (
              courses.slice(0, 6).map((course) => {
                const enrolledCount = enrollmentCountByCourse[course.id] || 0;
                return (
                  <Card
                    key={course.id}
                    className="group overflow-hidden border-slate-100 hover:border-aims-green/20 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative sm:w-48 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-100">
                          <img
                            src={course.thumbnail_url || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop"}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-aims-green transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                                {course.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs font-bold shrink-0">
                              {enrolledCount} Enrolled
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="font-medium text-slate-500">
                              Faculty: <strong className="text-slate-700">{course.instructor?.full_name || "Unassigned"}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="h-8 text-xs font-bold" asChild>
                                <Link href="/instructor/courses">
                                  Edit
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs font-bold text-aims-green border-emerald-200 hover:bg-emerald-50" asChild>
                                <Link href="/instructor/students">
                                  Students
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:space-y-8">
          {/* Recent Student Enrollments */}
          <Card className="border-slate-100 overflow-hidden shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-50 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Users className="h-4 w-4 text-aims-navy" />
                  Recent Enrollments
                </CardTitle>
                <CardDescription className="text-xs">
                  Newly registered students
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                {enrollments.length} Total
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading roster...</div>
              ) : enrollments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No student enrollments yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {enrollments.slice(0, 5).map((enr) => (
                    <div key={enr.id} className="flex items-center gap-3 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <Avatar className="h-9 w-9 ring-1 ring-slate-100">
                        <AvatarImage src={enr.student?.avatar_url || ""} />
                        <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                          {initials(enr.student?.full_name || "Student")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {enr.student?.full_name || "Student"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {enr.course?.title || "Nursing Course"}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-gradient-to-br from-aims-navy/[0.07] to-aims-green/[0.07] overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-aims-navy" />
                Quick Actions
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Key instructor administrative functions
              </p>
              {[
                { label: "Create Online MCQ Exam", icon: FileQuestion, color: "text-purple-600 bg-purple-50", href: "/instructor/exams" },
                { label: "Manage Course Content", icon: FileEdit, color: "text-blue-600 bg-blue-50", href: "/instructor/courses" },
                { label: "Post Announcement", icon: MessageSquarePlus, color: "text-aims-green bg-aims-green/10", href: "/instructor/announcements" },
                { label: "View Enrolled Students", icon: Users, color: "text-amber-600 bg-amber-50", href: "/instructor/students" },
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={act.label}
                    href={act.href}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:shadow-md border border-slate-100 transition-all group text-left"
                  >
                    <div
                      className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${act.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 font-bold text-xs sm:text-sm text-slate-800 group-hover:text-aims-navy transition-colors">
                      {act.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-aims-navy group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
