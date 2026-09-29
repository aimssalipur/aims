"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Settings,
  CalendarDays,
  GraduationCap,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { triggerDataRefresh } from "@/lib/refresh-event";

interface DashboardTopbarProps {
  role: UserRole;
  userName: string;
}

export function DashboardTopbar({ role, userName }: DashboardTopbarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [greetingText, setGreetingText] = useState("Welcome");
  const [todayText, setTodayText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const first = userName.split(" ")[0];

  const handleRefreshData = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerDataRefresh();
    router.refresh();
    toast({
      title: "Data Refreshed ✅",
      description: "Fetched latest records and status.",
      variant: "success",
    });
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreetingText("Good morning");
    else if (h < 17) setGreetingText("Good afternoon");
    else setGreetingText("Good evening");

    setTodayText(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const roleBadge: Record<UserRole, { variant: any; label: string }> = {
    student: { variant: "default", label: "Student Portal" },
    instructor: { variant: "secondary", label: "Faculty Portal" },
    admin: { variant: "warning", label: "Admin Panel" },
    accountant: { variant: "indigo", label: "Finance Portal" },
  };

  const bellLink: Record<UserRole, string> = {
    student: "/student/announcements",
    instructor: "/instructor/announcements",
    admin: "/admin/announcements",
    accountant: "/accountant/reports",
  };

  const settingsLink: Record<UserRole, string> = {
    admin: "/admin/settings",
    instructor: "/instructor/profile",
    student: "/student/profile",
    accountant: "/accountant/profile",
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === "student") {
      router.push(`/student/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (role === "instructor") {
      router.push(`/instructor/students?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (role === "admin") {
      router.push(`/admin/users?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (role === "accountant") {
      router.push(`/accountant/fees?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 xl:px-8 py-4 sm:py-5">
        {/* Left: Greeting */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="hidden sm:flex h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-aims-navy/10 to-aims-green/10 items-center justify-center">
            <GraduationCap className="h-6 w-6 text-aims-navy" strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight" suppressHydrationWarning>
                {greetingText}, {first} 👋
              </h1>
              <Badge
                variant={roleBadge[role].variant as any}
                className="text-[10px] uppercase tracking-wider font-bold hidden sm:inline-flex"
              >
                {roleBadge[role].label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="font-medium" suppressHydrationWarning>{todayText || "Today"}</span>
              <span className="text-slate-300">·</span>
              <span className="hidden sm:inline font-medium">
                Ready for another productive day at AIMS
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search + actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-none sm:w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything & hit enter..."
              className="pl-10 pr-4 h-11 bg-slate-50 border-slate-100 focus:bg-white rounded-xl text-sm"
            />
          </form>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-11 px-3 sm:px-3.5 gap-2 rounded-xl border-slate-200 text-slate-700 hover:text-aims-navy hover:bg-slate-50 font-bold shadow-xs transition-all"
              title="Refresh Data (without reloading site)"
            >
              <RotateCw className={cn("h-4 w-4 text-aims-navy shrink-0", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline text-xs font-bold">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Announcements & Notifications"
            >
              <Link href={bellLink[role]}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Settings & Profile"
            >
              <Link href={settingsLink[role]}>
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

