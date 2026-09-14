"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Award,
  Clock,
  Calendar,
  ShieldCheck,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  monthlyEnrollments,
  dailyActiveUsers,
  courseCompletionRates,
  dummyCourses,
  dummyStudents,
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#94A3B8"];

// Custom Glassmorphic Tooltip for Monthly Enrollments
const EnrollmentCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/60 ring-1 ring-white/10 text-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-1.5">
          <span className="font-extrabold text-slate-200">{label} 2025</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
            Admissions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-slate-400 font-medium">New Students:</span>
          <span className="font-black text-sm text-white tabular-nums">{val}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Glassmorphic Tooltip for Daily Active Users (Supports Total & Breakdown)
const ActiveUsersCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;
    const total =
      (rawData.students || 0) + (rawData.instructors || 0) + (rawData.admin || 0);

    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-3 rounded-xl shadow-2xl border border-slate-700/60 ring-1 ring-white/10 text-xs min-w-[175px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
          <span className="font-bold text-slate-200">{label} Activity</span>
          <span className="font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[11px] tabular-nums">
            {total} Active
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
              Students
            </span>
            <span className="font-bold text-white tabular-nums">
              {rawData.students || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.7)]" />
              Staff
            </span>
            <span className="font-bold text-white tabular-nums">
              {rawData.instructors || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
              Admin
            </span>
            <span className="font-bold text-white tabular-nums">
              {rawData.admin || 0}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Glassmorphic Tooltip for Donut Pie Chart
const PieCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-2xl border border-slate-700/60 ring-1 ring-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color || data.fill }}
          />
          <span className="font-bold text-slate-200">{data.name}:</span>
          <span className="font-black text-sm text-white tabular-nums">
            {data.value}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [enrollmentView, setEnrollmentView] = useState<"area" | "bar">("area");
  const [enrollmentTimeframe, setEnrollmentTimeframe] = useState<"12m" | "6m">("12m");
  const [activeUsersMode, setActiveUsersMode] = useState<"breakdown" | "total">("breakdown");
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const displayedEnrollments = useMemo(() => {
    return enrollmentTimeframe === "6m"
      ? monthlyEnrollments.slice(-6)
      : monthlyEnrollments;
  }, [enrollmentTimeframe]);

  const totalEnrollments = useMemo(() => {
    return displayedEnrollments.reduce((sum, d) => sum + d.enrollments, 0);
  }, [displayedEnrollments]);

  const peakEnrollment = useMemo(() => {
    return displayedEnrollments.reduce(
      (max, d) => (d.enrollments > max.enrollments ? d : max),
      displayedEnrollments[0]
    );
  }, [displayedEnrollments]);

  const avgEnrollment = useMemo(() => {
    return Math.round(totalEnrollments / displayedEnrollments.length);
  }, [totalEnrollments, displayedEnrollments]);

  const processedActiveUsers = useMemo(() => {
    return dailyActiveUsers.map((d) => ({
      ...d,
      total: (d.students || 0) + (d.instructors || 0) + (d.admin || 0),
    }));
  }, []);

  const weeklyTotalLogins = useMemo(() => {
    return processedActiveUsers.reduce((sum, d) => sum + d.total, 0);
  }, [processedActiveUsers]);

  const peakActiveDay = useMemo(() => {
    return processedActiveUsers.reduce(
      (max, d) => (d.total > max.total ? d : max),
      processedActiveUsers[0]
    );
  }, [processedActiveUsers]);

  const avgDailyLogins = useMemo(() => {
    return Math.round(weeklyTotalLogins / processedActiveUsers.length);
  }, [weeklyTotalLogins, processedActiveUsers]);

  const currentPieSelection =
    activePieIndex !== null ? courseCompletionRates[activePieIndex] : null;

  const metrics = [
    {
      label: "Total Students",
      value: "328",
      change: "+15 this month",
      trend: "up",
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      ring: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Faculty",
      value: "18",
      change: "+2 this month",
      trend: "up",
      icon: GraduationCap,
      gradient: "from-purple-500 to-violet-700",
      ring: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      label: "Active Programs",
      value: "8",
      change: "Across 3 departments",
      trend: "neutral",
      icon: BookOpen,
      gradient: "from-aims-navy to-blue-700",
      ring: "bg-aims-navy/10",
      color: "text-aims-navy",
    },
    {
      label: "Total Enrollments",
      value: "1,442",
      change: "+8.2% MoM",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-aims-green to-teal-600",
      ring: "bg-aims-green/10",
      color: "text-aims-green",
    },
  ];

  const topCourses = dummyCourses.slice(0, 5).map((c, i) => ({
    ...c,
    students: [98, 87, 76, 68, 54][i],
    revenue: [84500, 72500, 62000, 58000, 48000][i],
  }));

  const maxRevenue = useMemo(() => {
    return Math.max(...topCourses.map((c) => c.revenue));
  }, [topCourses]);

  const recentStudents = dummyStudents.slice(0, 6);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      {/* Hero banner */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-36 -left-10 w-80 h-80 bg-aims-navy/25 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 grid lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
              <ShieldCheck className="h-3 w-3" /> Admin Control Center
            </Badge>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Good day, Admin! 🏛️
              <br />
              <span className="text-white/90 font-semibold text-sm sm:text-xl md:text-2xl">
                Here's how AIMS Salipur is performing this month.
              </span>
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-3 max-w-2xl">
              {[
                { k: "New Admits", v: "24", c: "from-aims-navy to-blue-700" },
                { k: "Placement Rate", v: "95%", c: "from-aims-green to-teal-600" },
                { k: "Revenue", v: "₹3.4L", c: "from-purple-500 to-violet-700" },
                { k: "Satisfaction", v: "98%", c: "from-rose-500 to-pink-600" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/15"
                >
                  <div className="text-lg sm:text-2xl font-extrabold">{s.v}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/75 mt-0.5 sm:mt-1">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-white/15 space-y-3 sm:space-y-5 flex flex-col justify-between">
            <div className="space-y-1">
              <Badge className="bg-white/20 border-0 text-white w-fit text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                <Calendar className="h-3 w-3 mr-1" /> Current Month
              </Badge>
              <div className="text-xs sm:text-sm text-white/90 font-semibold pt-0.5 sm:pt-1">
                Month-on-Month Growth
              </div>
            </div>
            {/* mini spark area */}
            <div className="h-16 sm:h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEnrollments.slice(-8)}>
                  <defs>
                    <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#fff"
                    strokeWidth={2}
                    fill="url(#miniGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                +32%
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-white/75 flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                compared to last month
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className="group relative overflow-hidden border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
            >
              <CardContent className="p-3.5 sm:p-5 md:p-6 relative">
                <div
                  className={cn(
                    "absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                    m.gradient
                  )}
                  style={{ filter: "blur(32px)", opacity: 0.18 }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shadow-md transition-transform group-hover:scale-110",
                        m.ring,
                        m.color
                      )}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={2.1} />
                    </div>
                    {m.trend === "up" && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-extrabold text-aims-green bg-aims-green/10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Up
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-500 mb-0.5 sm:mb-1 truncate">
                    {m.label}
                  </p>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-0.5 sm:mb-1.5 truncate">
                    {m.value}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{m.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Enrollments Area / Bar Chart */}
        <Card className="lg:col-span-2 border-slate-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <Badge variant="default" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold w-fit gap-1 bg-aims-navy/10 text-aims-navy border-aims-navy/20 hover:bg-aims-navy/15">
                  <TrendingUp className="h-3 w-3" /> Growth Analytics
                </Badge>
                <CardTitle className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Monthly Enrollment Trends
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                  New student enrollments across all nursing & paramedical programs
                </CardDescription>
              </div>

              {/* View & Timeframe Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 6M vs 12M switcher */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setEnrollmentTimeframe("6m")}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      enrollmentTimeframe === "6m"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Last 6M
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnrollmentTimeframe("12m")}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      enrollmentTimeframe === "12m"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    All 12M
                  </button>
                </div>

                {/* Area vs Bar switcher */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setEnrollmentView("area")}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      enrollmentView === "area"
                        ? "bg-aims-navy text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnrollmentView("bar")}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      enrollmentView === "bar"
                        ? "bg-aims-navy text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <BarChart3 className="h-3 w-3" />
                    Bar
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-slate-50 border border-slate-200/70 text-slate-700 px-2.5 py-1 rounded-lg">
                <span className="text-slate-400">Total:</span>
                <span className="font-extrabold text-slate-900 tabular-nums">{totalEnrollments}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-blue-50 border border-blue-200/70 text-blue-700 px-2.5 py-1 rounded-lg">
                <span className="text-blue-500">Peak Month:</span>
                <span className="font-extrabold text-blue-900">{peakEnrollment.month} ({peakEnrollment.enrollments})</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 border border-emerald-200/70 text-emerald-700 px-2.5 py-1 rounded-lg">
                <span className="text-emerald-500">Monthly Avg:</span>
                <span className="font-extrabold text-emerald-900 tabular-nums">{avgEnrollment} / mo</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
            <div className="h-[230px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {enrollmentView === "area" ? (
                  <AreaChart
                    data={displayedEnrollments}
                    margin={{ top: 15, right: 10, bottom: 0, left: -15 }}
                  >
                    <defs>
                      <linearGradient id="areaEnrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                        <stop offset="60%" stopColor="#1E3A8A" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                      dx={-4}
                    />
                    <Tooltip content={<EnrollmentCustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#1E3A8A"
                      strokeWidth={3}
                      fill="url(#areaEnrollGrad)"
                      activeDot={{
                        r: 6,
                        strokeWidth: 3,
                        stroke: "#ffffff",
                        fill: "#1E3A8A",
                        className: "shadow-xl",
                      }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={displayedEnrollments}
                    margin={{ top: 15, right: 10, bottom: 0, left: -15 }}
                  >
                    <defs>
                      <linearGradient id="barEnrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#1E3A8A" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                      dx={-4}
                    />
                    <Tooltip
                      content={<EnrollmentCustomTooltip />}
                      cursor={{ fill: "#f8fafc", radius: 8 }}
                    />
                    <Bar
                      dataKey="enrollments"
                      fill="url(#barEnrollGrad)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Doughnut Course Completion with Center Gauge */}
        <Card className="border-slate-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <Badge variant="success" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold w-fit gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Award className="h-3 w-3" /> Learning Pace
            </Badge>
            <CardTitle className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Course Completion
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
              Overall student milestone breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-5 pb-4 sm:pb-6 pt-0">
            {/* Donut Chart with Center Display */}
            <div className="relative h-[200px] sm:h-[230px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionRates}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={92}
                    paddingAngle={4}
                    cornerRadius={5}
                    dataKey="value"
                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {courseCompletionRates.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        className="cursor-pointer transition-transform duration-300 hover:opacity-90"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums transition-all">
                  {currentPieSelection ? `${currentPieSelection.value}%` : `${courseCompletionRates[0].value}%`}
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                  {currentPieSelection ? currentPieSelection.name : "Completed"}
                </span>
              </div>
            </div>

            {/* Segment Progress Meters */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 mt-1">
              {courseCompletionRates.map((c, i) => {
                const barGradients = [
                  "from-emerald-500 to-teal-600",
                  "from-blue-500 to-indigo-600",
                  "from-slate-400 to-slate-500",
                ];
                const isHovered = activePieIndex === i;
                return (
                  <div
                    key={c.name}
                    className={cn(
                      "p-2 rounded-xl transition-all cursor-pointer",
                      isHovered ? "bg-slate-100 shadow-sm" : "hover:bg-slate-50"
                    )}
                    onMouseEnter={() => setActivePieIndex(i)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: c.color || PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="font-bold text-slate-700">{c.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {c.value}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                          barGradients[i % barGradients.length]
                        )}
                        style={{ width: `${c.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Daily Active Users Bar Diagram */}
        <Card className="border-slate-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="warning" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold w-fit gap-1 bg-amber-50 text-amber-700 border-amber-200">
                  <Clock className="h-3 w-3" /> Engagement
                </Badge>
                <CardTitle className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Daily Active Users
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Logins & platform activity this week
                </CardDescription>
              </div>

              {/* View mode toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveUsersMode("breakdown")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                    activeUsersMode === "breakdown"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  By Role
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUsersMode("total")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                    activeUsersMode === "total"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Total
                </button>
              </div>
            </div>

            {/* Metric indicators */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="font-semibold text-slate-500">
                Peak: <span className="font-extrabold text-slate-900">{peakActiveDay.day} ({peakActiveDay.total} logins)</span>
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                Avg: {avgDailyLogins} / day
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
            <div className="h-[210px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedActiveUsers}
                  margin={{ top: 15, right: 10, bottom: 0, left: -15 }}
                >
                  <defs>
                    <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="studentBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    <linearGradient id="instructorBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                    dx={-4}
                  />
                  <Tooltip
                    content={<ActiveUsersCustomTooltip />}
                    cursor={{ fill: "#f8fafc", radius: 8 }}
                  />
                  {activeUsersMode === "total" ? (
                    <Bar
                      dataKey="total"
                      fill="url(#emeraldBarGrad)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={38}
                    />
                  ) : (
                    <>
                      <Bar
                        dataKey="students"
                        stackId="roleStack"
                        fill="url(#studentBarGrad)"
                        maxBarSize={38}
                        name="Students"
                      />
                      <Bar
                        dataKey="instructors"
                        stackId="roleStack"
                        fill="url(#instructorBarGrad)"
                        maxBarSize={38}
                        name="Staff"
                      />
                      <Bar
                        dataKey="admin"
                        stackId="roleStack"
                        fill="url(#adminBarGrad)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={38}
                        name="Admin"
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role Legend when in breakdown mode */}
            {activeUsersMode === "breakdown" && (
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm" />
                  Students
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm" />
                  Staff
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm" />
                  Admin
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Courses with Capacity / Revenue Progress Bars */}
        <Card className="border-slate-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="gold" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold w-fit gap-1 bg-amber-50 text-amber-700 border-amber-200">
                  <BarChart3 className="h-3 w-3" /> Ranking
                </Badge>
                <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900">
                  Top Programs by Revenue
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {topCourses.map((c, i) => {
                const percent = Math.round((c.revenue / maxRevenue) * 100);
                return (
                  <div
                    key={c.id}
                    className="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className={cn(
                          "h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-xl font-extrabold text-xs flex items-center justify-center shadow-sm",
                          i === 0
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200"
                            : i === 1
                            ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200"
                            : i === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-200"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate leading-tight">
                          {c.title}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Users className="h-3 w-3 text-slate-400" /> {c.students} active students
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm tabular-nums">
                          ₹{(c.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-aims-green flex items-center justify-end gap-0.5">
                          <DollarSign className="h-2.5 w-2.5" />
                          Earned
                        </div>
                      </div>
                    </div>

                    {/* Visual Bar Diagram Indicator */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-aims-navy via-blue-600 to-teal-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      {/* Recent Enrollments */}
      <Card className="border-slate-100 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex-row items-center justify-between space-y-0">
          <div>
            <Badge variant="default" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold w-fit">
              <Users className="h-3 w-3 mr-1.5" /> Newest
            </Badge>
            <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900">
              Recent Admissions
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-aims-navy font-bold text-xs h-8 sm:h-9 -mr-2">
            View All
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {recentStudents.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 md:p-5 hover:bg-slate-50 transition-colors"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 ring-2 ring-white shadow-sm">
                  <AvatarImage src={s.avatar_url!} />
                  <AvatarFallback className="text-[10px] sm:text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    {initials(s.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate leading-tight">
                    {s.full_name}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                    {s.course_of_interest}
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] sm:text-[10px] font-bold shrink-0">
                  Enrolled
                </Badge>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
