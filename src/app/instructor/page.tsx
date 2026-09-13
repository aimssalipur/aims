"use client";

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
} from "lucide-react";
import { dummyCourses, dummyStudents } from "@/lib/dummy-data";
import { cn, initials } from "@/lib/utils";
import Link from "next/link";

export default function InstructorDashboard() {
  const myCourses = dummyCourses.filter(
    (_, i) => i % 2 === 0
  ).map((c, i) => ({
    ...c,
    enrolled: [42, 38, 35, 29][i],
    avgProgress: [62, 48, 75, 33][i],
  }));
  const totalStudents = myCourses.reduce((a, b) => a + b.enrolled, 0);

  const stats = [
    {
      label: "My Courses",
      value: String(myCourses.length),
      sub: "Active this semester",
      icon: GraduationCap,
      gradient: "from-emerald-500 to-emerald-700",
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Total Students",
      value: String(totalStudents),
      sub: "+5 new this week",
      icon: Users,
      gradient: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Avg Completion",
      value: "55%",
      sub: "+8% MoM growth",
      icon: BarChart3,
      gradient: "from-purple-500 to-violet-700",
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      label: "Announcements",
      value: "12",
      sub: "3 posted this month",
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
        <div className="relative grid lg:grid-cols-3 gap-6 p-6 md:p-8 lg:p-10">
          <div className="lg:col-span-2 space-y-4">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit">
              <Award className="h-3 w-3 mr-1" /> Faculty Spotlight
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
              Welcome back, Dr. Priyanka! 👩‍⚕️
              <br />
              <span className="text-white/85 font-semibold text-xl md:text-2xl">
                Your students are making fantastic progress this semester.
              </span>
            </h2>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                className="bg-white text-aims-green hover:bg-slate-50 gap-2 shadow-lg"
                asChild
              >
                <Link href="/instructor/announcements">
                  <Plus className="h-4.5 w-4.5" />
                  Post Announcement
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur gap-2"
                asChild
              >
                <Link href="/instructor/courses">
                  <FileEdit className="h-4.5 w-4.5" />
                  Edit Course Content
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-5 bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/15">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/90">Weekly Activity</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/20">
                Mon - Sun
              </span>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end justify-between gap-2 h-28 pt-2">
              {[45, 72, 60, 88, 75, 40, 30].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-white/40 to-white shadow-inner"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-bold text-white/75">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
              <div>
                <div className="text-2xl font-extrabold">18.5h</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Teaching Time
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">92%</div>
                <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
                  Student Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-5 md:p-6 relative overflow-hidden">
                <div
                  className={cn(
                    "absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    s.bg
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-md",
                      s.bg,
                      s.color
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">
                    {s.label}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                    {s.value}
                  </h3>
                  <p className="text-xs font-bold text-aims-green flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {s.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Courses You're Teaching
              </h2>
              <p className="text-slate-500 mt-1">Monitor progress & manage content</p>
            </div>
            <Button variant="outline" size="lg" className="gap-2 h-11" asChild>
              <Link href="/instructor/courses">
                <FileEdit className="h-4 w-4" />
                Manage All
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {myCourses.map((course, idx) => (
              <Card
                key={course.id}
                className="group overflow-hidden border-slate-100 hover:border-aims-green/20 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-56 shrink-0 aspect-[16/10] md:aspect-auto overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={["default", "secondary", "warning", "gold"][idx] as any}
                          className="text-xs font-bold shadow-sm"
                        >
                          {["Core", "Core", "Elective", "Lab"][idx]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-5 md:p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1 group-hover:text-aims-green transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {course.enrolled} Students
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              48 Lessons
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-extrabold text-slate-900">
                            {course.avgProgress}%
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Avg Progress
                          </div>
                        </div>
                      </div>
                      <Progress value={course.avgProgress} className="h-2" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex -space-x-2">
                          {dummyStudents
                            .slice(idx * 3, idx * 3 + 4)
                            .map((stud, i) => (
                              <Avatar
                                key={stud.id}
                                className="h-7 w-7 ring-2 ring-white shadow-sm"
                              >
                                <AvatarImage src={stud.avatar_url!} />
                                <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                                  {initials(stud.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          <div className="h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                            +{course.enrolled - 4}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5 h-9 border-slate-200" asChild>
                            <Link href="/instructor/courses">
                              <FileEdit className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            className="gap-1.5 h-9 bg-aims-green hover:bg-aims-green/90"
                            asChild
                          >
                            <Link href="/instructor/students">
                              View Students
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:space-y-8">
          {/* Top Students */}
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-50 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Top Performers
                </CardTitle>
                <CardDescription className="text-sm">
                  This semester's stars
                </CardDescription>
              </div>
              <Badge variant="warning" className="text-xs font-bold">
                This Week
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {dummyStudents.slice(0, 5).map((stud, idx) => (
                  <div
                    key={stud.id}
                    className={cn(
                      "flex items-center gap-3 p-4 md:p-5 hover:bg-slate-50 transition-colors",
                      idx !== 4 && "border-b border-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-xs",
                        idx === 0
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md"
                          : idx === 1
                          ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                          : idx === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      #{idx + 1}
                    </div>
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                      <AvatarImage src={stud.avatar_url!} />
                      <AvatarFallback className="text-[10px] font-bold">
                        {initials(stud.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                        {stud.full_name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <BookOpenCheck className="h-3 w-3 text-aims-green" />
                        {[98, 96, 94, 91, 89][idx]}% Course Progress
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px] font-bold hidden sm:inline-flex">
                      {["9.8", "9.6", "9.4", "9.1", "8.9"][idx]} GPA
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-gradient-to-br from-aims-navy/[0.07] to-aims-green/[0.07] overflow-hidden">
            <CardContent className="p-5 md:p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-aims-navy" />
                Quick Actions
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Shortcuts to save you time
              </p>
              {[
                { label: "Upload Lecture Video", icon: Video, color: "text-blue-600 bg-blue-50", href: "/instructor/courses" },
                { label: "Create New Assignment", icon: FileEdit, color: "text-purple-600 bg-purple-55", href: "/instructor/courses" },
                { label: "Post Announcement", icon: MessageSquarePlus, color: "text-aims-green bg-aims-green/10", href: "/instructor/announcements" },
                { label: "Mark Attendance", icon: CheckCircle2, color: "text-amber-600 bg-amber-50", href: "/instructor/students" },
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={act.label}
                    href={act.href}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white hover:shadow-md border border-slate-100 transition-all group text-left"
                  >
                    <div
                      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${act.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1 font-bold text-sm text-slate-800 group-hover:text-aims-navy transition-colors">
                      {act.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-aims-navy group-hover:translate-x-0.5 transition-all" />
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
