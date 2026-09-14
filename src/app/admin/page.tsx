"use client";

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const COLORS = ["#059669", "#1E3A8A", "#F59E0B", "#EF4444"];

export default function AdminDashboardPage() {
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
        <div className="relative p-6 md:p-8 lg:p-10 grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Admin Control Center
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Good day, Admin! 🏛️
              <br />
              <span className="text-white/90 font-semibold text-xl md:text-2xl">
                Here's how AIMS Salipur is performing this month.
              </span>
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 max-w-2xl">
              {[
                { k: "New Admits", v: "24", c: "from-aims-navy to-blue-700" },
                { k: "Placement Rate", v: "95%", c: "from-aims-green to-teal-600" },
                { k: "Revenue", v: "₹3.4L", c: "from-purple-500 to-violet-700" },
                { k: "Satisfaction", v: "98%", c: "from-rose-500 to-pink-600" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15"
                >
                  <div className="text-2xl font-extrabold">{s.v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/75 mt-1">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/15 space-y-5 flex flex-col justify-between">
            <div className="space-y-1">
              <Badge className="bg-white/20 border-0 text-white w-fit text-[10px] font-bold uppercase tracking-widest">
                <Calendar className="h-3 w-3 mr-1" /> Current Month
              </Badge>
              <div className="text-sm text-white/90 font-semibold pt-1">
                Month-on-Month Growth
              </div>
            </div>
            {/* mini spark area */}
            <div className="h-24 w-full">
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
                    strokeWidth={2.5}
                    fill="url(#miniGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-4xl font-extrabold tracking-tight">
                +32%
              </div>
              <div className="text-xs font-bold text-white/75 flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                compared to last month
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className="group relative overflow-hidden border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
            >
              <CardContent className="p-5 md:p-6 relative">
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
                        "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-md transition-transform group-hover:scale-110",
                        m.ring,
                        m.color
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.1} />
                    </div>
                    {m.trend === "up" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-aims-green bg-aims-green/10 px-2.5 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-500 mb-1">
                    {m.label}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1.5">
                    {m.value}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">{m.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Enrollments Area/Line */}
        <Card className="lg:col-span-2 border-slate-100 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-3 flex-col md:flex-row md:items-start md:justify-between space-y-0 gap-4">
            <div>
              <Badge variant="default" className="mb-2 text-xs font-bold">
                <TrendingUp className="h-3 w-3 mr-1.5" /> Analytics
              </Badge>
              <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                Monthly Enrollment Trends
              </CardTitle>
              <CardDescription className="text-sm mt-1.5">
                New student enrollments across all programs (2025)
              </CardDescription>
            </div>
            <Tabs defaultValue="area" className="w-full md:w-auto">
              <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
                <TabsTrigger value="area" className="h-8 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-aims-navy data-[state=active]:shadow-sm">
                  Area
                </TabsTrigger>
                <TabsTrigger value="bar" className="h-8 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-aims-navy data-[state=active]:shadow-sm">
                  Bar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-6 pt-3">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEnrollments} margin={{ top: 20, right: 20, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                    dy={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                      fontFamily: "Inter",
                    }}
                    labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#1E3A8A"
                    strokeWidth={3.5}
                    fill="url(#enrollGrad)"
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff", fill: "#1E3A8A" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Doughnut completion */}
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-3">
            <Badge variant="success" className="mb-2 text-xs font-bold w-fit">
              <Award className="h-3 w-3 mr-1.5" /> Performance
            </Badge>
            <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              Course Completion
            </CardTitle>
            <CardDescription className="text-sm mt-1.5">
              Overall student progress breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6 pt-2">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionRates}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {courseCompletionRates.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={4}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                      fontFamily: "Inter",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 pt-1 border-t border-slate-100 mt-2">
              {courseCompletionRates.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-md shrink-0"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-sm font-bold text-slate-700">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                      {c.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Active Users bar */}
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-3">
            <Badge variant="warning" className="mb-2 text-xs font-bold w-fit">
              <Clock className="h-3 w-3 mr-1.5" /> Engagement
            </Badge>
            <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
              Daily Active Users
            </CardTitle>
            <CardDescription className="text-sm mt-1.5">
              Logins this week
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-6 pt-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActiveUsers} margin={{ top: 20, right: 10, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                    dy={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9", radius: 8 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="url(#barGrad)"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="gold" className="mb-2 text-xs font-bold w-fit">
                  <BarChart3 className="h-3 w-3 mr-1.5" /> Ranking
                </Badge>
                <CardTitle className="text-lg font-extrabold text-slate-900">
                  Top Programs by Revenue
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {topCourses.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-4 md:p-5 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={cn(
                      "h-9 w-9 shrink-0 rounded-xl font-extrabold text-xs flex items-center justify-center",
                      i === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md"
                        : i === 1
                        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                        : i === 2
                        ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                      {c.title}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Users className="h-3 w-3" /> {c.students} students
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900 text-sm tabular-nums">
                      ₹{(c.revenue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-aims-green flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3" />
                      Revenue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100 flex-row items-center justify-between space-y-0">
            <div>
              <Badge variant="default" className="mb-2 text-xs font-bold w-fit">
                <Users className="h-3 w-3 mr-1.5" /> Newest
              </Badge>
              <CardTitle className="text-lg font-extrabold text-slate-900">
                Recent Admissions
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-aims-navy font-bold text-xs h-9 -mr-2">
              View All
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {recentStudents.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-4 md:p-5 hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white shadow-sm">
                    <AvatarImage src={s.avatar_url!} />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                      {initials(s.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                      {s.full_name}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                      {s.course_of_interest}
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
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
