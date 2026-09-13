"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { AuthSidebar } from "@/components/auth/auth-sidebar";
import { RoleSelector } from "@/components/auth/role-selector";
import type { UserRole } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Chrome,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import gsap from "gsap";

export default function LoginPage() {
  const formCardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".login-form-box", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Successfully authenticated. Now fetch user's profile to get their role and approval status.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", data.user.id)
        .single();

      if (profile && !profile.approved && profile.role === "student") {
        await supabase.auth.signOut();
        toast({
          title: "Application Pending ⏳",
          description: "Your application is pending admin approval. Please contact our counselors on WhatsApp to activate your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const finalRole = profile?.role || selectedRole;

      toast({
        title: "Welcome back!",
        description: `Signed in successfully.`,
        variant: "success",
      });
      
      router.push(`/${finalRole}`);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your registered email address in the field below first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });
      if (error) throw error;
      toast({
        title: "Password Reset Sent 📧",
        description: `Instructions have been sent to ${email}. Please check your inbox.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Reset Request Note",
        description: err.message || "If this email is registered, password instructions have been dispatched.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?role=${selectedRole}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        toast({
          title: "Google authentication failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      <AuthSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile logo */}
        <div className="lg:hidden px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white w-full">
          <Logo size="sm" />
          <Link href="/" className="text-sm font-bold text-aims-navy hover:underline">
            ← Back Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-14 w-full">
          <div ref={formCardRef} className="login-form-box w-full max-w-md xl:max-w-lg mx-auto">
            <div className="mb-7 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aims-navy/10 mb-4 sm:mb-5">
                <LogIn className="h-3.5 w-3.5 text-aims-navy" />
                <span className="text-xs font-bold uppercase tracking-wider text-aims-navy">
                  Sign In to Your Account
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Welcome Back 👋
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed break-words">
                Please sign in to continue. Select your role below to access
                the right dashboard.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                Login as
              </Label>
              <RoleSelector
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />
            </div>

            <div className="w-full mt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                className="w-full h-11 sm:h-12 gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-extrabold text-sm shadow-sm transition-all"
                disabled={isLoading}
              >
                <Chrome className="h-4.5 w-4.5 text-red-500" />
                Continue with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="my-7 sm:my-8 flex items-center gap-3 sm:gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                Or sign in with email
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        selectedRole === "student"
                          ? "your.name@aims.edu"
                          : selectedRole === "instructor"
                          ? "faculty.name@aims.edu"
                          : "admin@aims.edu"
                      }
                      className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className="text-slate-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs sm:text-sm font-bold text-aims-navy hover:text-aims-navy/80 hover:underline transition-colors break-words cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 sm:pl-11 pr-11 sm:pr-12 h-11 sm:h-12 text-sm sm:text-base w-full"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      defaultChecked
                    />
                    <div className="h-4 w-4 rounded border-2 border-slate-300 bg-white transition-all peer-checked:bg-aims-navy peer-checked:border-aims-navy group-hover:border-aims-navy/50 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors break-words">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2 text-sm sm:text-base h-11 sm:h-12 shadow-lg shadow-aims-navy/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign up CTA */}
            <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-aims-navy/[0.03] border border-slate-100">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl bg-aims-green/15 text-aims-green flex items-center justify-center">
                  <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">
                    New at AIMS? Start your journey today
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 break-words">
                    Students can apply for admission and create their account
                    in under 2 minutes.
                  </p>
                  <Link href="/signup">
                    <Button variant="secondary" size="sm" className="gap-1.5 w-full sm:w-auto">
                      Create Student Account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
