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
  Building,
  ShieldCheck,
  Edit3,
  Calendar,
  DollarSign,
} from "lucide-react";
import { initials } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function AccountantProfilePage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: "Accountant",
    email: "finance@aims.edu",
    phone: "+91 99000 00015",
    office_branch: "Salipur Main Campus",
    bio: "Head of Accounts Department. Responsible for managing business balances, auditing expenditures, and verifying course tuition fee logs.",
  });

  const supabase = createClient();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({
            full_name: data.full_name,
            email: data.email,
            phone: data.whatsapp || "+91 99000 00015",
            office_branch: "Salipur Main Campus",
            bio: profile.bio,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: profile.full_name,
            whatsapp: profile.phone,
          })
          .eq("id", user.id);

        if (error) throw error;

        toast({
          title: "Profile updated successfully",
          description: "Your changes have been saved.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const profileAvatar =
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces";

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      {/* Profile Header Banner */}
      <Card className="overflow-hidden border-0 shadow-xl relative">
        <div className="relative h-48 md:h-60 bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        {/* Profile Info Overlay Card */}
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-16 md:-mt-20 mb-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-2xl rounded-3xl">
              <AvatarImage src={profileAvatar} alt={profile.full_name} />
              <AvatarFallback className="text-3xl font-extrabold bg-indigo-600 text-white">
                {initials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 pt-16 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.full_name}
                </h2>
                <Badge variant="indigo" className="bg-indigo-50 text-indigo-700 border-indigo-100 flex gap-1 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Accountant
                </Badge>
              </div>
              <p className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-400" />
                Finance & Accounting Department · {profile.office_branch}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Brief details */}
        <div className="space-y-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Email Address</div>
                  <div className="text-sm font-bold text-slate-950">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</div>
                  <div className="text-sm font-bold text-slate-950">{profile.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Joined Date</div>
                  <div className="text-sm font-bold text-slate-950">15th August 2026</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile details */}
        <div className="lg:col-span-2">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-900">Personal Information</CardTitle>
              <CardDescription className="font-semibold text-slate-400">
                Update your staff details and contact numbers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Full Name</Label>
                  <Input
                    className="h-11 rounded-xl"
                    value={profile.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">WhatsApp / Phone</Label>
                  <Input
                    className="h-11 rounded-xl"
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Office Branch</Label>
                <Input
                  className="h-11 rounded-xl"
                  disabled
                  value={profile.office_branch}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Department Bio / Duties</Label>
                <Textarea
                  rows={4}
                  className="rounded-xl"
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                />
              </div>

              <Separator className="bg-slate-100" />

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg"
                >
                  <Save className="h-4.5 w-4.5" />
                  {saving ? "Saving changes..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
