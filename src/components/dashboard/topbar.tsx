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
  PanelLeftClose,
  PanelLeftOpen,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { triggerDataRefresh } from "@/lib/refresh-event";
import { useSidebarStore } from "@/lib/sidebar-store";
import { useActiveLiveClass } from "@/lib/use-active-live-class";

interface DashboardTopbarProps {
  role: UserRole;
  userName: string;
}

export function DashboardTopbar({ role, userName }: DashboardTopbarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isOpen, toggleSidebar, setIsOpen } = useSidebarStore();
  const { activeClass } = useActiveLiveClass(role);
  const [searchQuery, setSearchQuery] = useState("");
  const [greetingText, setGreetingText] = useState("Welcome");
  const [todayText, setTodayText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const first = userName.split(" ")[0];

  // Sync saved sidebar state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aims_dashboard_sidebar_open");
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
    } catch {}
  }, [setIsOpen]);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

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
        {/* Left: Sidebar Toggle + Greeting */}
        <div className="flex items-start sm:items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-11 w-11 rounded-xl text-slate-600 hover:text-aims-navy hover:bg-slate-100 transition-colors shrink-0"
            title={isOpen ? "Close Sidebar (Ctrl+B)" : "Open Sidebar (Ctrl+B)"}
            aria-label="Toggle navigation sidebar"
          >
            {isOpen ? (
              <PanelLeftClose className="h-5 w-5 text-slate-700" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-slate-700" />
            )}
          </Button>

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

        {/* Center: Realtime Active Live Class Alert */}
        {activeClass && (
          <Link
            href={
              role === "instructor" || role === "admin"
                ? `/instructor/live/${activeClass.id}`
                : `/student/live/${activeClass.id}`
            }
            className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all border border-red-400/30 group shrink-0"
            title={`Enter Ongoing Live Class: ${activeClass.title}`}
          >
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <div className="flex flex-col text-left max-w-[180px] lg:max-w-[240px] xl:max-w-[320px] truncate">
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-extrabold">LIVE NOW</span>
                <span className="truncate opacity-85">{activeClass.course_title}</span>
              </span>
              <span className="text-xs font-black text-white truncate leading-tight mt-0.5">
                {activeClass.title}
              </span>
            </div>
            <span className="bg-white text-red-600 group-hover:bg-amber-300 group-hover:text-slate-950 text-xs font-black px-2.5 py-1 rounded-xl ml-1 flex items-center gap-1.5 shrink-0 shadow-sm transition-colors">
              <Video className="h-3.5 w-3.5" />
              <span>Enter Class →</span>
            </span>
          </Link>
        )}

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

