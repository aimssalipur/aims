"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Save,
  Award,
  BookOpen,
  Calendar,
  Building,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { initials } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function InstructorProfilePage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: "Dr. Priyanka Sharma",
    email: "priyanka.sharma@aims.edu",
    phone: "+91 94379 59054",
    department: "Nursing & Clinical Practices",
    designation: "Senior Faculty & Exam Mentor",
    experience: "12+ Years in Nursing Coaching",
    office_hours: "Monday - Friday, 10 AM - 4 PM",
    bio: "Senior Nursing Instructor at AIMS Salipur specializing in Anatomy, Physiology, Medical-Surgical Nursing, and OSSSC/AIIMS NORCET exam coaching.",
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (data) {
            setProfile((prev: any) => ({
              ...prev,
              full_name: data.full_name || prev.full_name,
              email: data.email || prev.email,
              phone: data.whatsapp || prev.phone,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading instructor profile:", err);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            full_name: profile.full_name,
            whatsapp: profile.phone,
          })
          .eq("id", user.id);
      }
      toast({
        title: "Profile Updated ✨",
        description: "Your faculty credentials and contact details have been saved.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-aims-green via-emerald-700 to-emerald-900 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-white/30 shadow-2xl">
            <AvatarImage
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces"
              alt={profile.full_name}
            />
            <AvatarFallback className="text-xl font-extrabold bg-white text-emerald-800">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Faculty Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {profile.full_name}
            </h1>
            <p className="text-white/85 text-xs sm:text-sm max-w-xl leading-relaxed">
              {profile.designation} · {profile.department}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Summary */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-md bg-white">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-aims-green" />
                Faculty Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Department
                </span>
                <p className="font-bold text-slate-800 text-sm">{profile.department}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Experience
                </span>
                <p className="font-bold text-slate-800 text-sm">{profile.experience}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Office Hours
                </span>
                <p className="font-bold text-slate-800 text-sm">{profile.office_hours}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Campus Location
                </span>
                <p className="font-bold text-slate-800 text-sm">Salipur Main Campus, Odisha</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-xl bg-white">
            <CardHeader className="p-6 border-b border-slate-100">
              <CardTitle className="text-lg font-extrabold text-slate-900">
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs">
                Update your faculty profile, contact info, and bio.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-xs font-bold text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    disabled
                    value={profile.email}
                    className="h-11 rounded-xl text-sm bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                    Phone / WhatsApp Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="designation" className="text-xs font-bold text-slate-700">
                    Academic Designation
                  </Label>
                  <Input
                    id="designation"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-bold text-slate-700">
                  Biography &amp; Teaching Focus
                </Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="rounded-xl text-sm p-3"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 px-6 rounded-xl font-bold bg-aims-green hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-aims-green/20"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving Changes..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
