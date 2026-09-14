"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  GraduationCap,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  ChevronRight,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  ShieldCheck,
  FileEdit,
  MessageSquarePlus,
  Palette,
  Calendar,
  TrendingUp,
  Home,
  Video,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "My Courses", icon: BookOpen, badge: "4" },
    { href: "/student/announcements", label: "Announcements", icon: Bell, badge: "New" },
    { href: "/student/profile", label: "My Profile", icon: UserIcon },
  ],
  instructor: [
    { href: "/instructor", label: "Overview", icon: LayoutDashboard },
    { href: "/instructor/courses", label: "Manage Courses", icon: FileEdit },
    { href: "/instructor/students", label: "My Students", icon: Users },
    { href: "/instructor/announcements", label: "Announcements", icon: MessageSquarePlus },
    { href: "/instructor/profile", label: "Profile", icon: UserIcon },
  ],
  admin: [
    { href: "/admin", label: "Analytics", icon: BarChart3 },
    { href: "/admin/media", label: "Frontend Images", icon: ImageIcon },
    { href: "/admin/users", label: "User Management", icon: ShieldCheck },
    { href: "/admin/announcements", label: "Announcements", icon: MessageSquarePlus },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
  ],
  accountant: [
    { href: "/accountant", label: "Overview", icon: LayoutDashboard },
    { href: "/accountant/transactions", label: "Transactions", icon: DollarSign },
    { href: "/accountant/fees", label: "Student Fees", icon: GraduationCap },
    { href: "/accountant/reports", label: "Financial Reports", icon: BarChart3 },
    { href: "/accountant/profile", label: "Profile", icon: UserIcon },
  ],
};

const roleTheme: Record<
  UserRole,
  { gradient: string; pill: string; pillText: string; welcome: string; accent: string }
> = {
  student: {
    gradient: "from-aims-navy via-blue-700 to-blue-800",
    pill: "bg-blue-400/20 text-blue-100 border-blue-400/30",
    pillText: "Student",
    welcome: "Student Dashboard",
    accent: "text-blue-300",
  },
  instructor: {
    gradient: "from-aims-green via-emerald-700 to-emerald-800",
    pill: "bg-emerald-400/20 text-emerald-100 border-emerald-400/30",
    pillText: "Instructor",
    welcome: "Faculty Dashboard",
    accent: "text-emerald-300",
  },
  admin: {
    gradient: "from-amber-500 via-orange-600 to-amber-700",
    pill: "bg-amber-300/25 text-amber-100 border-amber-300/30",
    pillText: "Administrator",
    welcome: "Admin Control Panel",
    accent: "text-amber-300",
  },
  accountant: {
    gradient: "from-indigo-600 via-violet-700 to-purple-800",
    pill: "bg-indigo-300/25 text-indigo-100 border-indigo-300/30",
    pillText: "Accountant",
    welcome: "Finance Portal",
    accent: "text-indigo-300",
  },
};

interface DashboardSidebarProps {
  role: UserRole;
  user: {
    full_name: string;
    email: string;
    avatar_url?: string | null;
    roles?: UserRole[];
  };
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const theme = roleTheme[role];
  const navItems = navConfig[role];

  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* noop */
    }
    toast({
      title: "Signed out",
      description: "You have been logged out successfully.",
    });
    router.push("/login");
    router.refresh();
  };

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "" : "")}>
      {/* Top: Logo + Role badge */}
      <div className={cn("px-5 py-5 border-b", mobile ? "border-slate-100" : "border-white/10")}>
        {mobile ? (
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
                role === "student"
                  ? "bg-aims-navy/10 text-aims-navy border-aims-navy/20"
                  : role === "instructor"
                    ? "bg-aims-green/10 text-aims-green border-aims-green/20"
                    : role === "accountant"
                      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
              )}
            >
              {theme.pillText}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-white/95 backdrop-blur rounded-xl p-1.5 shadow-xl ring-2 ring-white/20">
                <Logo showText={false} size="sm" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base leading-tight">
                  AIMS
                </h2>
                <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                  {theme.welcome}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border",
                theme.pill
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              Logged in as {theme.pillText}
            </span>
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        <div
          className={cn(
            "px-2 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest",
            mobile ? "text-slate-400" : "text-white/50"
          )}
        >
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setSheetOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                mobile
                  ? isActive
                    ? "bg-aims-navy/10 text-aims-navy shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  : isActive
                    ? `bg-white/15 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm`
                    : "text-white/75 hover:text-white hover:bg-white/10"
              )}
            >
              {isActive && !mobile && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-white" />
              )}
              <div
                className={cn(
                  "h-8.5 w-8.5 shrink-0 rounded-lg flex items-center justify-center transition-all duration-200",
                  mobile
                    ? isActive
                      ? "bg-aims-navy text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-aims-navy/10 group-hover:text-aims-navy"
                    : isActive
                      ? "bg-white text-aims-navy shadow-md"
                      : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.1} />
              </div>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    mobile
                      ? item.badge === "New"
                        ? "bg-red-100 text-red-600"
                        : "bg-aims-navy/10 text-aims-navy"
                      : item.badge === "New"
                        ? "bg-red-400/30 text-white"
                        : "bg-white/20 text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && !mobile && (
                <ChevronRight className="h-4 w-4 text-white/80" />
              )}
            </Link>
          );
        })}

        {/* Quick links */}
        <div className={cn("px-2 pt-3 pb-1 mt-2 border-t", mobile ? "border-slate-100" : "border-white/10")}>
          <div className={cn("px-2 pb-1.5 text-[9px] font-bold uppercase tracking-widest", mobile ? "text-slate-400" : "text-white/50")}>
            Quick Navigation
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/"
              onClick={() => mobile && setSheetOpen(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs transition-all duration-200",
                mobile
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
              )}
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>Main Site</span>
            </Link>
            <Link
              href={role === "instructor" ? "/instructor/courses" : role === "admin" ? "/admin" : "/student/courses"}
              onClick={() => mobile && setSheetOpen(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs transition-all duration-200",
                mobile
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                  : "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/20"
              )}
            >
              <Video className="h-3.5 w-3.5 shrink-0" />
              <span>Live Class</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom user card & Active Panel Switcher (Optimized for both Mobile & Desktop) */}
      <div
        className={cn(
          "p-2.5 sm:p-3 border-t mt-auto",
          mobile ? "border-slate-100 bg-white" : "border-white/10"
        )}
      >
        <div
          className={cn(
            "rounded-2xl p-2.5 sm:p-3 transition-all",
            mobile
              ? "bg-slate-50 border border-slate-200/80 shadow-2xs"
              : "bg-white/10 backdrop-blur-sm ring-1 ring-white/15"
          )}
        >
          {/* User info row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar className={cn("h-9 w-9 shrink-0 ring-2 shadow-xs", mobile ? "ring-aims-navy/20" : "ring-white/30")}>
              <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
              <AvatarFallback className={cn("text-xs font-bold", mobile ? "bg-aims-navy text-white" : "bg-white text-aims-navy")}>
                {initials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className={cn("font-black text-xs sm:text-sm leading-tight truncate", mobile ? "text-slate-900" : "text-white")}>
                {user.full_name}
              </div>
              <div className={cn("text-[10px] sm:text-[11px] font-medium leading-tight truncate mt-0.5", mobile ? "text-slate-500" : "text-white/70")}>
                {user.email}
              </div>
            </div>
            <Link
              href={`/${role}/profile`}
              onClick={() => mobile && setSheetOpen(false)}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
                mobile
                  ? "bg-slate-200/70 text-slate-600 hover:bg-slate-300"
                  : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              )}
              title="Edit Profile"
            >
              <UserIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Active Panel Switcher Grid */}
          {user.roles && user.roles.length > 1 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className={cn("text-[9px] font-black uppercase tracking-widest", mobile ? "text-slate-400" : "text-white/60")}>
                  Active Panel
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <div
                className={cn(
                  "grid gap-1 p-1 rounded-xl",
                  user.roles.length > 3 ? "grid-cols-4" : user.roles.length === 3 ? "grid-cols-3" : "grid-cols-2",
                  mobile
                    ? "bg-slate-200/70 border border-slate-300/40"
                    : "bg-black/30 border border-white/10"
                )}
              >
                {user.roles.includes("student") && (
                  <Link
                    href="/student"
                    onClick={() => mobile && setSheetOpen(false)}
                    className={cn(
                      "text-[10px] font-extrabold text-center py-1.5 px-0.5 rounded-lg transition-all truncate",
                      role === "student"
                        ? mobile
                          ? "bg-white text-aims-navy shadow-xs font-black ring-1 ring-slate-200"
                          : "bg-white text-aims-navy shadow font-black"
                        : mobile
                          ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          : "text-white/65 hover:text-white hover:bg-white/10"
                    )}
                  >
                    Student
                  </Link>
                )}
                {user.roles.includes("instructor") && (
                  <Link
                    href="/instructor"
                    onClick={() => mobile && setSheetOpen(false)}
                    className={cn(
                      "text-[10px] font-extrabold text-center py-1.5 px-0.5 rounded-lg transition-all truncate",
                      role === "instructor"
                        ? mobile
                          ? "bg-white text-emerald-800 shadow-xs font-black ring-1 ring-slate-200"
                          : "bg-white text-emerald-800 shadow font-black"
                        : mobile
                          ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          : "text-white/65 hover:text-white hover:bg-white/10"
                    )}
                  >
                    Staff
                  </Link>
                )}
                {user.roles.includes("accountant") && (
                  <Link
                    href="/accountant"
                    onClick={() => mobile && setSheetOpen(false)}
                    className={cn(
                      "text-[10px] font-extrabold text-center py-1.5 px-0.5 rounded-lg transition-all truncate",
                      role === "accountant"
                        ? mobile
                          ? "bg-white text-indigo-900 shadow-xs font-black ring-1 ring-slate-200"
                          : "bg-white text-indigo-900 shadow font-black"
                        : mobile
                          ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          : "text-white/65 hover:text-white hover:bg-white/10"
                    )}
                  >
                    Finance
                  </Link>
                )}
                {user.roles.includes("admin") && (
                  <Link
                    href="/admin"
                    onClick={() => mobile && setSheetOpen(false)}
                    className={cn(
                      "text-[10px] font-extrabold text-center py-1.5 px-0.5 rounded-lg transition-all truncate",
                      role === "admin"
                        ? mobile
                          ? "bg-white text-amber-800 shadow-xs font-black ring-1 ring-slate-200"
                          : "bg-white text-amber-800 shadow font-black"
                        : mobile
                          ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          : "text-white/65 hover:text-white hover:bg-white/10"
                    )}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Sign out button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full h-8 text-[11px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all",
              mobile
                ? "bg-rose-50 border border-rose-200/80 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                : "bg-white/10 border border-white/15 text-white hover:bg-rose-600 hover:border-rose-600 hover:text-white"
            )}
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col w-72 xl:w-80 min-h-screen shrink-0 bg-gradient-to-b sticky top-0 z-30",
          theme.gradient
        )}
      >
        {/* Decorative blobs */}
        <div className="absolute top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 -left-16 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col flex-1 min-h-screen">
          <NavContent />
        </div>
      </aside>

      {/* Mobile header: Sleek, compact & modern h-14 bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-700 hover:bg-slate-100" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[82%] max-w-[320px] p-0 bg-white flex flex-col h-full border-r border-slate-200">
              <NavContent mobile />
            </SheetContent>
          </Sheet>

          <Logo size="sm" />

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100">
              <Link href={role === "student" ? "/student/announcements" : role === "instructor" ? "/instructor/announcements" : role === "admin" ? "/admin/announcements" : "/accountant/reports"} title="Announcements">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>
            </Button>
            <Link href={`/${role}/profile`} className="cursor-pointer" title="My Profile">
              <Avatar className="h-8 w-8 ring-2 ring-aims-navy/20 hover:scale-105 transition-transform">
                <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                <AvatarFallback className="text-[10px] font-bold bg-aims-navy text-white">
                  {initials(user.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
