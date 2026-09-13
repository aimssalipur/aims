"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { AuthSidebar } from "@/components/auth/auth-sidebar";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageCircle,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

const fallbackCourses = [
  { id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "B.Sc. Nursing (Basic)", description: "Core GNM/B.Sc. Nursing preparation" },
  { id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "General Nursing & Midwifery (GNM)", description: "Comprehensive preparation for GNM exams" },
  { id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", title: "Auxiliary Nurse Midwife (ANM)", description: "Preparation for ANM exams" },
  { id: "c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4", title: "Diploma in Hotel Management", description: "F&B, Front Office, Housekeeping training" },
  { id: "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5", title: "Certificate in Hospital Administration", description: "Management and healthcare ops training" },
  { id: "c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6", title: "Paramedical Diploma Course", description: "Lab tech, OT assistant preparation" },
  { id: "c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7", title: "Post Basic B.Sc. Nursing", description: "Advanced nursing theory & practice" },
  { id: "c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8", title: "Food & Beverage Service Training", description: "Culinary arts and service operations" }
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbCourses, setDbCourses] = useState<{ id: string; title: string; description?: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  // Fetch courses dynamically from database
  useEffect(() => {
    async function loadCourses() {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, description");
        if (data && !error) {
          setDbCourses(data);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      }
    }
    loadCourses();
  }, [supabase]);

  const coursesToDisplay = dbCourses.length > 0 ? dbCourses : fallbackCourses;

  const getWhatsAppLink = () => {
    const selectedTitles = coursesToDisplay
      .filter((c) => selectedCourses.includes(c.id))
      .map((c) => c.title)
      .join(", ");
    
    const message = `Hello AIMS Salipur Admissions,

I have submitted my application for enrollment and would like to activate my login.

My Details:
• Name: ${form.fullName}
• Email: ${form.email}
• WhatsApp Number: ${form.phone}
• Selected Programs: ${selectedTitles}

Please approve my email in the system. Thank you!`;

    return `https://wa.me/919437959054?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields to continue.",
        variant: "destructive",
      });
      return;
    }
    if (selectedCourses.length === 0) {
      toast({
        title: "No course selected",
        description: "Please select at least one program to apply.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const selectedTitles = coursesToDisplay
        .filter((c) => selectedCourses.includes(c.id))
        .map((c) => c.title)
        .join(", ");

      // 1. Create account via Server Admin Client (with approved: false)
      const signupRes = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          course: selectedTitles,
          course_ids: selectedCourses.join(","),
        }),
      });

      const signupData = await signupRes.json();
      if (signupData.error) {
        toast({
          title: "Sign up failed",
          description: signupData.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2. Redirect to WhatsApp immediately
      toast({
        title: "Application received! 🎉",
        description: "Redirecting to WhatsApp to activate your account...",
        variant: "success",
      });

      const whatsAppUrl = getWhatsAppLink();
      window.location.href = whatsAppUrl;

      // Reset loading state after a delay in case the user navigates back
      setTimeout(() => setIsLoading(false), 5000);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      <AuthSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-20 w-full">
          <Logo size="sm" />
          <Link href="/" className="text-sm font-bold text-aims-navy hover:underline shrink-0 ml-2">
            ← Back Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-12 w-full">
          <div className="w-full max-w-md xl:max-w-lg mx-auto py-6 sm:py-8">
            <div className="mb-6 sm:mb-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aims-green/10 mb-4 sm:mb-5">
                <UserPlus className="h-3.5 w-3.5 text-aims-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-aims-green">
                  Student Application Form
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Begin Your Journey ✨
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed break-words">
                Apply for admission at AIMS. Fill in your details and our
                counselors will get in touch within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName" className="text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        className="pl-10 sm:pl-11 h-11 sm:h-12 w-full text-sm sm:text-base"
                        value={form.fullName}
                        onChange={update("fullName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        className="pl-10 sm:pl-11 h-11 sm:h-12 w-full text-sm sm:text-base"
                        value={form.email}
                        onChange={update("email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="pl-10 sm:pl-11 h-11 sm:h-12 w-full text-sm sm:text-base"
                        value={form.phone}
                        onChange={update("phone")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-slate-700 font-semibold block mb-1">
                      Interested Course(s) <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-slate-500 mb-2.5">
                      Select one or more programs you would like to apply for:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] sm:max-h-[220px] overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-white">
                      {coursesToDisplay.map((c) => {
                        const isSelected = selectedCourses.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCourses((prev) =>
                                prev.includes(c.id)
                                  ? prev.filter((id) => id !== c.id)
                                  : [...prev, c.id]
                              );
                            }}
                            className={`relative flex items-start gap-1.5 sm:gap-2.5 p-2 rounded-lg sm:rounded-xl border cursor-pointer select-none transition-all hover:shadow-sm ${
                              isSelected
                                ? "border-aims-green bg-aims-green/5 ring-1 ring-aims-green"
                                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 rounded flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-aims-green border-aims-green text-white"
                                  : "bg-white border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 leading-tight block truncate">
                                {c.title}
                              </span>
                              {c.description && (
                                <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate mt-0.5">
                                  {c.description}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Create Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        className="pl-10 sm:pl-11 pr-11 sm:pr-12 h-11 sm:h-12 w-full text-sm sm:text-base"
                        value={form.password}
                        onChange={update("password")}
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
                    {/* Password strength hint */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-8 sm:w-10 rounded-full ${
                              form.password.length > i * 2 ? "bg-aims-green" : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {form.password.length < 4
                          ? "Weak"
                          : form.password.length < 8
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    By applying, you get:
                  </h5>
                  {[
                    "Free career counseling session with our experts",
                    "Campus tour & demo class with senior faculty",
                    "Scholarship assessment (merit & need-based)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-aims-green shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-slate-700 break-words">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-slate-300 bg-white transition-all peer-checked:bg-aims-navy peer-checked:border-aims-navy flex items-center justify-center group-hover:border-aims-navy/50">
                    <svg className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors break-words">
                    I agree to be contacted by AIMS via call, WhatsApp & email
                    regarding my application. I have read and accept the{" "}
                    <Link href="#" className="text-aims-navy font-bold hover:underline whitespace-nowrap">
                      Terms of Use
                    </Link>{" "}
                    &{" "}
                    <Link href="#" className="text-aims-navy font-bold hover:underline whitespace-nowrap">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full gap-2 text-sm sm:text-base h-12 sm:h-13 shadow-lg shadow-aims-navy/25 py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting application...
                    </>
                  ) : (
                    <>
                      Submit Application & Create Account
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Already have account */}
              <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className="font-extrabold text-aims-navy hover:text-aims-navy/80 hover:underline transition-colors"
                >
                  Sign in instead
                </Link>
              </div>

            {/* Trust strip */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400">
              {["🔒 SSL Secure", "🛡️ Data Protected", "⚡ Quick Response"].map((t) => (
                <span key={t} className="text-xs font-bold whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
