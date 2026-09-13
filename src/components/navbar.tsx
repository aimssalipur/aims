"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  GraduationCap,
  Menu,
  Phone,
  BookOpen,
  Users,
  UserCircle,
  LogIn,
  LogOut,
  ChevronRight,
  Video,
  LayoutDashboard,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const navLinks = [
  { name: "Home", href: "/#home", icon: BookOpen },
  { name: "Courses", href: "/#courses", icon: GraduationCap },
  { name: "Live Class", href: "/login", icon: Video },
  { name: "About", href: "/#about", icon: Users },
  { name: "Contact", href: "/#contact", icon: Phone },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    role?: string;
    avatar_url?: string;
  } | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch and listen for active auth session
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
          const { data } = await supabase
            .from("profiles")
            .select("full_name, role, avatar_url")
            .eq("id", currentUser.id)
            .single();

          if (isMounted && data) {
            setProfile(data);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        /* noop */
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, role, avatar_url")
            .eq("id", session.user.id)
            .single();

          if (isMounted && data) {
            setProfile(data);
          }
        } catch {
          /* noop */
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSheetOpen(false);
      toast({
        title: "Signed Out",
        description: "You have been logged out successfully.",
      });
      router.push("/");
      router.refresh();
    } catch {
      /* noop */
    }
  };

  const isDashboard =
    pathname.startsWith("/student") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/accountant") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  const userRole = profile?.role || "student";
  const dashboardHref = `/${userRole}`;
  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo with responsive scaling */}
          <div className="flex items-center shrink-0">
            <Logo size="sm" className="sm:hidden" />
            <Logo size="md" className="hidden sm:flex" />
          </div>

          {/* Desktop Nav Links: Only shown on large screens (1024px+) to prevent tablet/iPad collision */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {!isDashboard &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 xl:px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-aims-navy hover:bg-aims-navy/5 transition-all duration-200"
                >
                  {link.name}
                </Link>
              ))}
          </nav>

          {/* Right side actions & Tablet/Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If LOGGED IN: Display Dashboard Shortcut & User Profile Dropdown */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Direct Dashboard Link Button */}
                <Link href={dashboardHref} className="hidden sm:block">
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-aims-navy/20"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer ring-1 ring-slate-200"
                      aria-label="User menu"
                    >
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-aims-navy/20">
                        <AvatarImage src={profile?.avatar_url} alt={userName} />
                        <AvatarFallback className="bg-aims-navy text-white text-xs font-bold">
                          {initials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-900 max-w-[110px] truncate leading-tight">
                          {userName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {userRole}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-xl">
                    <DropdownMenuLabel className="p-2">
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        {userName}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1.5">
                        <Badge
                          variant={
                            userRole === "admin"
                              ? "destructive"
                              : userRole === "instructor"
                              ? "secondary"
                              : "default"
                          }
                          className="text-[10px] uppercase font-bold px-2 py-0"
                        >
                          {userRole}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href={dashboardHref} className="flex items-center gap-2.5 py-2">
                        <LayoutDashboard className="h-4 w-4 text-aims-navy" />
                        <span className="font-semibold text-xs">My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href={`${dashboardHref}/profile`} className="flex items-center gap-2.5 py-2">
                        <UserIcon className="h-4 w-4 text-slate-600" />
                        <span className="font-semibold text-xs">My Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="rounded-xl cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center gap-2.5 py-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-bold text-xs">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* If NOT LOGGED IN: Show Login & Apply Now */
              <>
                <Link href="/login" className="hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50"
                  >
                    <LogIn className="h-4 w-4 text-aims-navy" />
                    <span>Login</span>
                  </Button>
                </Link>

                <Link href="/signup" className="hidden sm:block">
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-aims-navy/20 hover:shadow-lg transition-all"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Apply Now</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile / Tablet Menu Trigger (Visible on mobile and iPad: < 1024px) */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-slate-700 hover:bg-slate-100/80 active:scale-95 transition-transform"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-aims-navy" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-96 p-0 bg-white">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-4 sm:p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <Logo showText={true} size="sm" />
                    </div>
                  </SheetHeader>

                  {/* If user logged in: mobile user header card */}
                  {user && (
                    <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80 flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-aims-navy/30 shrink-0">
                        <AvatarImage src={profile?.avatar_url} alt={userName} />
                        <AvatarFallback className="bg-aims-navy text-white text-xs font-bold">
                          {initials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-sm text-slate-900 truncate leading-snug">
                          {userName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </div>
                        <div className="mt-1">
                          <Badge
                            variant={userRole === "admin" ? "destructive" : "default"}
                            className="text-[9px] uppercase font-bold px-1.5 py-0"
                          >
                            {userRole}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
                    {!isDashboard &&
                      navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-aims-navy/5 hover:text-aims-navy transition-all duration-200 group"
                            >
                              <div className="h-8 w-8 rounded-lg bg-aims-navy/10 text-aims-navy flex items-center justify-center group-hover:bg-aims-navy group-hover:text-white transition-all">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="flex-1 text-sm font-bold">
                                {link.name}
                              </span>
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-aims-navy group-hover:translate-x-1 transition-all" />
                            </Link>
                          </SheetClose>
                        );
                      })}
                  </nav>

                  <div className="p-4 sm:p-6 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                    {user ? (
                      <>
                        <SheetClose asChild>
                          <Link href={dashboardHref} className="block w-full">
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full h-11 gap-2 font-bold text-sm shadow-md shadow-aims-navy/20"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Go to Dashboard
                            </Button>
                          </Link>
                        </SheetClose>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleSignOut}
                          className="w-full h-11 gap-2 font-bold text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link href="/login" className="block w-full">
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full h-11 gap-2 font-bold text-sm bg-white"
                            >
                              <LogIn className="h-4 w-4" />
                              Student &amp; Staff Login
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/signup" className="block w-full">
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full h-11 gap-2 font-bold text-sm shadow-md shadow-aims-navy/20"
                            >
                              <UserCircle className="h-4 w-4" />
                              Apply for Admission
                            </Button>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
