"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Upload,
  Award,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Edit3,
  MapPin,
  Building,
  ShieldCheck,
} from "lucide-react";
import { initials, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "Riya Sahu",
    email: "riya.sahu@aims.edu",
    phone: "+91 99000 00010",
    whatsapp: "+91 99000 00010",
    dob: "12th March 2006",
    address: "Salipur, Cuttack, Odisha - 754202",
    guardian: "Sanjay Kumar Sahu",
    blood: "O+ve",
    bio: "Passionate nursing student committed to patient care. Excels in clinical skills and wants to specialize in Pediatric Nursing.",
  });

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
        variant: "success",
      });
    }, 900);
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const profileAvatar =
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces";

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      {/* Profile Header Banner */}
      <Card className="overflow-hidden border-0 shadow-xl relative">
        {/* Banner */}
        <div className="relative h-48 md:h-60 bg-gradient-to-br from-aims-navy via-blue-700 to-aims-green overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-aims-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 h-9 gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Banner
            </Button>
          </div>
        </div>

        <CardContent className="p-0 relative -mt-20 md:-mt-24">
          <div className="px-5 md:px-8 pb-6 pt-0">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div className="flex flex-col md:flex-row md:items-end gap-5">
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-br from-aims-navy via-aims-gold to-aims-green rounded-full blur opacity-70 animate-pulse" />
                  <div className="relative rounded-full p-1 bg-white shadow-xl">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-white">
                      <AvatarImage src={profileAvatar} />
                      <AvatarFallback className="text-2xl md:text-3xl font-extrabold bg-aims-gradient text-white">
                        {initials(form.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center text-aims-navy hover:bg-aims-navy hover:text-white transition-all group">
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="md:pb-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {form.full_name}
                    </h1>
                    <Badge variant="default" className="text-xs font-bold px-3 py-1">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Student ID: AIMS2024-0042
                    </Badge>
                    <Badge variant="gold" className="text-xs font-bold px-3 py-1">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      B.Sc. Nursing · 3rd Year · Semester VI
                    </span>
                    <span className="text-slate-300 hidden sm:inline">·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(new Date(Date.now() - 700 * 86400000))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:pb-3">
                <Button variant="outline" size="lg" className="gap-2 h-11">
                  <Upload className="h-4 w-4" />
                  Download ID Card
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={save}
                  disabled={saving}
                  className="gap-2 h-11 shadow-lg shadow-aims-navy/20"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Courses Enrolled", value: "4", icon: BookOpen, color: "from-blue-500 to-blue-700" },
                { label: "Avg. Progress", value: "58%", icon: TrendingUp, color: "from-aims-green to-emerald-700" },
                { label: "Attendance", value: "94%", icon: Award, color: "from-amber-500 to-orange-600" },
                { label: "Certificates", value: "2", icon: Award, color: "from-purple-500 to-violet-700" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 p-4 md:p-5 transition-colors group"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                      {s.value}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Edit Form */}
        <Card className="lg:col-span-2 border-slate-100">
          <CardHeader className="p-6 md:p-7 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-aims-navy/10 text-aims-navy flex items-center justify-center">
                <Edit3 className="h-5.5 w-5.5" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold">Personal Information</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Update your profile details. This helps us serve you better.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-7 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Profile Photo
                </Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-aims-navy/30 bg-slate-50/50 transition-colors">
                  <Avatar className="h-14 w-14 ring-2 ring-white shadow">
                    <AvatarImage src={profileAvatar} />
                    <AvatarFallback>{initials(form.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 mb-1">
                      Upload a new photo
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      JPG, PNG up to 5MB · Square crop recommended
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary" size="sm" className="gap-1.5 h-9">
                        <Upload className="h-3.5 w-3.5" />
                        Choose File
                      </Button>
                      <Button variant="outline" size="sm" className="h-9">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="full_name" className="pl-11 h-12" value={form.full_name} onChange={update("full_name")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" className="pl-11 h-12" value={form.email} onChange={update("email")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="phone" className="pl-11 h-12" value={form.phone} onChange={update("phone")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input id="whatsapp" className="pl-11 h-12" value={form.whatsapp} onChange={update("whatsapp")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="dob" className="pl-11 h-12" value={form.dob} onChange={update("dob")} readOnly />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Residential Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                  <Input id="address" className="pl-11 h-12" value={form.address} onChange={update("address")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian">Guardian / Parent Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="guardian" className="pl-11 h-12" value={form.guardian} onChange={update("guardian")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood">Blood Group</Label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input id="blood" className="pl-11 h-12 font-bold text-red-600" value={form.blood} onChange={update("blood")} readOnly />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={form.bio}
                  onChange={update("bio")}
                  className="resize-none"
                />
              </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <Button variant="outline" size="lg" className="h-11">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={save}
                disabled={saving}
                className="gap-2 h-11 shadow-lg shadow-aims-navy/20"
              >
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6 lg:space-y-8">
          {/* Academic Progress */}
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-aims-green" />
                Academic Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-5">
              {[
                { name: "Anatomy & Physiology", progress: 78 },
                { name: "Pharmacology", progress: 52 },
                { name: "Clinical Nursing", progress: 91 },
                { name: "Community Health", progress: 33 },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">
                      {s.name}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${
                        s.progress >= 80
                          ? "text-aims-green"
                          : s.progress >= 50
                          ? "text-aims-navy"
                          : "text-amber-600"
                      }`}
                    >
                      {s.progress}%
                    </span>
                  </div>
                  <Progress value={s.progress} className="h-2" />
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-500">Overall</span>
                  <span className="text-lg font-extrabold gradient-text">58%</span>
                </div>
                <Progress value={58} className="h-3 [&>div]:bg-aims-gradient" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-br from-amber-50/50 via-transparent to-orange-50/50">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-3">
              {[
                { title: "Dean's List 2025", desc: "Top 5% of the cohort", color: "bg-amber-100 text-amber-700" },
                { title: "Quiz Champion", desc: "Pharmacology Quiz Bowl Winner", color: "bg-aims-navy/10 text-aims-navy" },
                { title: "100% Attendance", desc: "2024 Autumn Semester", color: "bg-aims-green/10 text-aims-green" },
              ].map((a) => (
                <div
                  key={a.title}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-10 w-10 shrink-0 rounded-xl ${a.color} flex items-center justify-center shadow-sm`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-sm text-slate-900 leading-tight">
                      {a.title}
                    </div>
                    <div className="text-xs text-slate-500">{a.desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
