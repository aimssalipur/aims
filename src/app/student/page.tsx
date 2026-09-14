"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  dummyCourses,
  dummyAnnouncements,
  dummyStudents,
  dummyDeadlines,
} from "@/lib/dummy-data";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  CalendarClock,
  Clock,
  ArrowRight,
  PlayCircle,
  Bell,
  CheckCircle2,
  FileText,
  Award,
  ChevronRight,
  Users,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { cn, formatDate, formatProgress, initials } from "@/lib/utils";

export default function StudentDashboard() {
  const myCourses = dummyCourses.slice(0, 4).map((c, i) => ({
    ...c,
    progress: [68, 42, 85, 27][i],
  }));
  const avgProgress = Math.round(
    myCourses.reduce((a, b) => a + b.progress, 0) / myCourses.length
  );
  const upcoming = dummyAnnouncements.slice(0, 3);

  const statCards = [
    {
      label: "Enrolled Courses",
      value: "4",
      sub: "2 new this semester",
      icon: BookOpen,
      gradient: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Overall Progress",
      value: `${avgProgress}%`,
      sub: "+12% this month",
      icon: TrendingUp,
      gradient: "from-aims-green to-emerald-700",
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Upcoming Deadlines",
      value: "3",
      sub: "2 due this week",
      icon: CalendarClock,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Attendance",
      value: "94%",
      sub: "Excellent 🏆",
      icon: CheckCircle2,
      gradient: "from-purple-500 to-violet-700",
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-aims-navy via-blue-700 to-aims-navy text-white relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 w-80 h-80 bg-aims-green/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
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
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit text-[10px] sm:text-xs py-0.5 px-2 sm:px-2.5">
              <Award className="h-3 w-3 mr-1" /> Star Student · Top 10%
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
              Keep going, Riya!
              <br />
              <span className="text-white/85 font-semibold text-sm sm:text-lg md:text-2xl">
                You're {avgProgress}% close to your semester goal.
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <Link href="/student/courses">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-aims-navy hover:bg-slate-100 gap-1.5 sm:gap-2 shadow-xl h-9 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm font-bold"
                >
                  <PlayCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  Continue Learning
                </Button>
              </Link>
              <a
                href="https://wa.me/919437959054"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 h-9 sm:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-xs sm:text-sm font-semibold transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                Talk to Counselor
              </a>
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col justify-between gap-4 sm:gap-5 bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/15">
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-white/85 font-bold text-xs sm:text-sm">Daily Goal</span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full bg-white/20">
                  Day 14/120
                </span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold mb-1.5 sm:mb-2">
                75<span className="text-base sm:text-xl font-bold text-white/60">%</span>
              </h3>
              <Progress value={75} className="h-2 sm:h-2.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-aims-gold [&>div]:to-aims-green" />
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/75 leading-relaxed">
                📚 Study for 1 more hour today to complete your daily goal.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/15">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-extrabold">12h</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-white/65 tracking-wider">
                  This Week
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-extrabold">28</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-white/65 tracking-wider">
                  Lessons
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-extrabold">8</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-white/65 tracking-wider">
                  Quizzes
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-3.5 sm:p-5 md:p-6 relative overflow-hidden">
                <div
                  className={cn(
                    "absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    stat.bg
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      "h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shadow-sm sm:shadow-md",
                      stat.bg,
                      stat.color
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.1} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-0.5 sm:mb-1 truncate">
                    {stat.label}
                  </p>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-0.5 sm:mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-aims-green flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {stat.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Continue Learning
              </h2>
              <p className="text-slate-500 mt-1">Pick up where you left off</p>
            </div>
            <Link
              href="/student/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-aims-navy hover:text-aims-navy/80 transition-colors group"
            >
              View All
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {myCourses.map((course, idx) => (
              <Card
                key={course.id}
                className="overflow-hidden border-slate-100 hover:border-aims-navy/20 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 md:w-56 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden sm:border-r border-slate-100">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-slate-900/40 sm:to-transparent" />
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="absolute inset-0 m-auto h-11 w-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 cursor-pointer"
                      title="Play Course"
                    >
                      <PlayCircle
                        className="h-5 w-5 text-aims-navy ml-0.5"
                        fill="currentColor"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold border-slate-200 text-slate-600 px-2.5 py-0.5"
                      >
                        {["Nursing", "Nursing", "Hospitality", "Paramedical"][idx]}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {["Sem 3", "Sem 2", "Sem 1", "Sem 4"][idx]}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1.5">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      {course.instructor?.full_name || "Dr. Faculty"} · {idx * 7 + 12} lectures
                    </p>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span
                          className={cn(
                            course.progress >= 80
                              ? "text-aims-green"
                              : course.progress >= 50
                              ? "text-aims-navy"
                              : "text-amber-600"
                          )}
                        >
                          {formatProgress(course.progress)}
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex -space-x-2">
                          {[0, 1, 2].map((i) => (
                            <Avatar
                              key={i}
                              className="h-6 w-6 ring-2 ring-white shadow-sm"
                            >
                              <AvatarImage
                                src={dummyStudents[(idx + i) % dummyStudents.length].avatar_url!}
                              />
                              <AvatarFallback className="text-[9px] font-bold">
                                {initials(dummyStudents[(idx + i) % dummyStudents.length].full_name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                            +{28 + idx}
                          </div>
                        </div>
                        <Button size="sm" variant="primary" className="gap-1.5 h-9" asChild>
                          <Link href={`/student/courses/${course.id}`}>
                            Continue
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:space-y-8">
          {/* Upcoming Deadlines */}
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 pb-4 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-amber-500" />
                  Upcoming
                </CardTitle>
                <CardDescription className="text-sm">
                  Due dates & exams
                </CardDescription>
              </div>
              <Badge variant="warning" className="text-xs font-bold">
                {dummyDeadlines.length} items
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {dummyDeadlines.map((deadline, idx) => (
                  <div
                    key={deadline.id}
                    className={cn(
                      "flex items-start gap-3 p-4 md:p-5 hover:bg-slate-50 transition-colors",
                      idx !== dummyDeadlines.length - 1 && "border-b border-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-11 w-11 shrink-0 rounded-xl flex flex-col items-center justify-center",
                        idx === 0
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {formatDate(deadline.date).split(" ")[0].slice(0, 3)}
                      </span>
                      <span className="text-lg font-extrabold leading-none">
                        {formatDate(deadline.date).split(" ")[1].slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
                        {deadline.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        {deadline.course}
                      </p>
                    </div>
                    {idx === 0 && (
                      <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100">
                        URGENT
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 pb-4 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-aims-navy" />
                  Announcements
                </CardTitle>
                <CardDescription className="text-sm">
                  Latest updates from AIMS
                </CardDescription>
              </div>
              <Link
                href="/student/announcements"
                className="text-xs font-bold text-aims-navy hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {upcoming.map((ann, idx) => (
                  <div
                    key={ann.id}
                    className={cn(
                      "p-4 md:p-5 hover:bg-slate-50 transition-colors",
                      idx !== upcoming.length - 1 && "border-b border-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {ann.title}
                      </h4>
                      {idx === 0 && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          ● New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(ann.created_at)}
                      </span>
                      <Link
                        href="/student/announcements"
                        className="inline-flex items-center gap-0.5 text-[11px] font-bold text-aims-navy hover:underline"
                      >
                        Read
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Card */}
          <Card className="border-0 bg-gradient-to-br from-aims-green/[0.08] to-aims-navy/[0.08] overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="h-16 w-16 rounded-2xl bg-aims-navy/5 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-aims-navy/20" />
                </div>
              </div>
              <div className="relative space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Need help? Talk to your mentor
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Book a free 15-min session with Dr. Priyanka to discuss
                  academics, career, or personal guidance.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow">
                    <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces" />
                    <AvatarFallback className="text-xs font-bold">
                      PS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-extrabold text-sm text-slate-900">
                      Dr. Priyanka Sharma
                    </div>
                    <div className="text-xs text-slate-500">
                      HOD · Nursing Dept.
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full mt-2 bg-aims-green hover:bg-aims-green/90 gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Book Mentorship Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
