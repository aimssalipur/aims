"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Settings,
  Globe2,
  DollarSign,
  Shield,
  Palette,
  Mail as MailIcon,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  Upload,
  Bell,
  CheckCircle2,
  Info,
  Image as ImageIcon,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    instituteName: "Achyutanand Institute of Medical Science",
    tagline: "Knowledge, Compassion, Care",
    established: "2026-07-16",
    phone: "+91 94379 59054",
    altPhone: "+91 98765 43210",
    email: "aimssalipur@gmail.com",
    address: "Salipur, Cuttack District, Odisha, India - 754202",
    about: "AIMS Salipur is Odisha's premier coaching academy for Nursing Officer competitive recruitment and entrance examinations. We prepare candidates for exams like OSSSC, AIIMS NORCET, ESIC, MNS, RRB, and OJEE with result-oriented guidelines, mock tests, and interactive secure classrooms.",
    facebookUrl: "https://www.facebook.com/profile.php?id=61592858652995",
    instagramUrl: "https://www.instagram.com/aimssalipur?stkn=MTgxZXE3cmhxN3dlcg==",
    youtubeUrl: "https://www.youtube.com/@AIMS_Official",
    whatsappUrl: "https://wa.me/919437959054",
  });

  const save = (section: string) =>
    toast({
      title: `${section} settings saved 💾`,
      description: "All changes have been applied successfully.",
      variant: "success",
    });

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Site Settings ⚙️
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Configure institute details, branding, and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="sticky top-20 z-20 bg-slate-50/60 backdrop-blur -mx-4 sm:-mx-6 xl:-mx-8 px-4 sm:px-6 xl:px-8 py-3 mb-2 border-y border-slate-200/60">
          <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap h-auto gap-1">
            {[
              { v: "general", i: Settings, l: "General" },
              { v: "branding", i: Palette, l: "Branding" },
              { v: "contact", i: MapPin, l: "Contact & Social" },
              { v: "features", i: Bell, l: "Features" },
            ].map((t) => {
              const Icon = t.i;
              return (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="h-9 px-4 rounded-xl text-xs md:text-sm font-bold gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100 transition-all"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.l}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/70 to-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                  <Globe2 className="h-5.5 w-5.5" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900">
                    Institute Information
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Basic details about your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Institute Full Name</Label>
                  <Input
                    className="h-12 text-base font-semibold"
                    value={form.instituteName}
                    onChange={(e) => setForm({ ...form, instituteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Tagline / Slogan</Label>
                  <Input
                    className="h-12 text-base"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Establishment Date</Label>
                  <Input
                    type="date"
                    className="h-12 font-semibold"
                    value={form.established}
                    onChange={(e) => setForm({ ...form, established: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Timezone</Label>
                  <Select defaultValue="asia/kolkata">
                    <SelectTrigger className="h-12 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/kolkata">Kolkata (IST) — UTC+5:30</SelectItem>
                      <SelectItem value="asia/dubai">Dubai (GST) — UTC+4:00</SelectItem>
                      <SelectItem value="europe/london">London (GMT) — UTC+0:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">About the Institute</Label>
                  <Textarea
                    rows={5}
                    className="resize-none leading-relaxed"
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                  />
                  <p className="text-xs font-semibold text-slate-400">
                    {form.about.length} / 1500 characters
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/70 flex-col md:flex-row gap-3 md:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Info className="h-4 w-4 text-amber-500" />
                Settings are auto-saved every 5 minutes
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="lg" className="gap-2 h-11 border-slate-200">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => save("General")}
                  className="gap-2 h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg shadow-amber-600/20"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* BRANDING */}
        <TabsContent value="branding" className="mt-6 space-y-6">
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 to-violet-50/50">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 text-white flex items-center justify-center shadow-md">
                  <Palette className="h-5.5 w-5.5" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900">
                    Branding & Visual Identity
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Customize logos, colors, and imagery
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-8 space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-dashed border-slate-300 bg-slate-50/50 overflow-hidden md:col-span-1">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center gap-4">
                    <div className="h-24 w-24 rounded-3xl bg-white shadow-lg flex items-center justify-center border border-slate-200">
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-18 w-18 object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900">Current Logo</div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">
                        logo.png · 420 × 420 px
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-10 w-full">
                      <Upload className="h-3.5 w-3.5" />
                      Replace Logo
                    </Button>
                  </CardContent>
                </Card>
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">
                      Color Palette Preview
                    </Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: "Navy", hex: "#1E3A8A", bg: "bg-aims-navy" },
                        { name: "Blue", hex: "#2563EB", bg: "bg-aims-navy-light" },
                        { name: "Green", hex: "#059669", bg: "bg-aims-green" },
                        { name: "Gold", hex: "#F59E0B", bg: "bg-aims-gold" },
                      ].map((c) => (
                        <div key={c.name} className="space-y-2">
                          <div className={`h-20 rounded-xl shadow-sm ${c.bg}`} />
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{c.name}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {c.hex}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">
                      Default Accent Gradient
                    </Label>
                    <div className="h-20 rounded-2xl shadow-lg bg-gradient-to-br from-aims-navy via-blue-600 to-aims-green relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                          backgroundSize: "16px 16px",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold tracking-wide">
                        AIMS Signature Gradient
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">
                    Upload Hero Background
                  </Label>
                  <div className="aspect-[16/9] rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-slate-50 flex flex-col items-center justify-center p-6 gap-3 cursor-pointer transition-colors group">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <ImageIcon className="h-7 w-7 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900 text-sm">Click to upload</div>
                      <div className="text-xs text-slate-500 mt-1 font-semibold">
                        JPG, PNG · 1920 × 1080 recommended
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">
                    Upload Favicon
                  </Label>
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 flex flex-col items-center justify-center p-6 gap-3 cursor-pointer transition-colors group">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 group-hover:bg-amber-50 flex items-center justify-center shadow-sm transition-colors">
                      <Globe className="h-7 w-7 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900 text-sm">Drop favicon here</div>
                      <div className="text-xs text-slate-500 mt-1 font-semibold">
                        ICO, PNG · 32 × 32 or 64 × 64
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/70 flex-col md:flex-row gap-3 md:justify-end">
              <Button variant="outline" size="lg" className="gap-2 h-11 border-slate-200">
                Reset
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => save("Branding")}
                className="gap-2 h-11 bg-gradient-to-r from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 border-0 shadow-lg shadow-purple-600/20"
              >
                <Save className="h-4 w-4" />
                Save Branding
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* CONTACT & SOCIAL */}
        <TabsContent value="contact" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Card className="border-slate-100 overflow-hidden">
              <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-aims-green to-teal-600 text-white flex items-center justify-center shadow-md">
                    <MapPin className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold text-slate-900">
                      Contact Details
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Shown on website footer & contact page
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-5">
                {[
                  { k: "Primary Phone", v: form.phone, on: (v: string) => setForm({ ...form, phone: v }), I: Phone, t: "tel", pl: "+91 98765 43210" },
                  { k: "Alternate Phone", v: form.altPhone, on: (v: string) => setForm({ ...form, altPhone: v }), I: Phone, t: "tel", pl: "+91 98765 43210" },
                  { k: "Email Address", v: form.email, on: (v: string) => setForm({ ...form, email: v }), I: MailIcon, t: "email", pl: "contact@aims.edu" },
                  { k: "Full Address", v: form.address, on: (v: string) => setForm({ ...form, address: v }), I: MapPin, t: "textarea", pl: "Street, City, Pin" },
                ].map((f) => {
                  const Icon = f.I;
                  return (
                    <div key={f.k} className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {f.k}
                      </Label>
                      {f.t === "textarea" ? (
                        <Textarea rows={2} className="resize-none leading-relaxed" value={f.v} onChange={(e) => f.on(e.target.value)} placeholder={f.pl} />
                      ) : (
                        <Input type={f.t} className="h-12 font-semibold" value={f.v} onChange={(e) => f.on(e.target.value)} placeholder={f.pl} />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-slate-100 overflow-hidden">
              <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/70 to-pink-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white flex items-center justify-center shadow-md">
                    <Globe className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold text-slate-900">
                      Social Media Links
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Icons appear in footer & contact section
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-5">
                {[
                  { k: "Facebook Page URL", v: form.facebookUrl, on: (v: string) => setForm({ ...form, facebookUrl: v }), pl: "facebook.com/yourpage", c: "bg-blue-500" },
                  { k: "Instagram Profile", v: form.instagramUrl, on: (v: string) => setForm({ ...form, instagramUrl: v }), pl: "instagram.com/yourpage", c: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" },
                  { k: "YouTube Channel", v: form.youtubeUrl, on: (v: string) => setForm({ ...form, youtubeUrl: v }), pl: "youtube.com/@channel", c: "bg-red-600" },
                  { k: "WhatsApp Chat Link", v: form.whatsappUrl, on: (v: string) => setForm({ ...form, whatsappUrl: v }), pl: "wa.me/919999999999", c: "bg-green-500" },
                ].map((s) => (
                  <div key={s.k} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                      <span className={`h-3.5 w-3.5 rounded-md shrink-0 ${s.c}`} />
                      {s.k}
                    </Label>
                    <Input
                      className="h-12 text-sm font-semibold"
                      value={s.v}
                      onChange={(e) => s.on(e.target.value)}
                      placeholder={s.pl}
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/70 flex-col md:flex-row gap-3 md:justify-end">
                <Button variant="outline" size="lg" className="gap-2 h-11 border-slate-200">
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => save("Contact & Social")}
                  className="gap-2 h-11 bg-gradient-to-r from-aims-green to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0 shadow-lg shadow-emerald-600/20"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features" className="mt-6 space-y-6">
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-sky-50/50">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-aims-navy to-blue-700 text-white flex items-center justify-center shadow-md">
                  <Bell className="h-5.5 w-5.5" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900">
                    Feature Toggles
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Enable or disable site features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-8 space-y-3">
              {[
                { name: "Open Admissions", desc: "Show 'Apply Now' CTA buttons and accept new applications", on: true },
                { name: "Student Registrations", desc: "Allow new student sign-ups on the portal", on: true },
                { name: "Announcement Notifications", desc: "Send email & WhatsApp alerts for new announcements", on: true },
                { name: "Placement Portal", desc: "Enable the placement cell page and job listings", on: false },
                { name: "Online Fee Payment", desc: "Show fee payment gateway integration (staging disabled)", on: false },
                { name: "Maintenance Mode", desc: "Show maintenance banner to visitors except admins", on: false },
              ].map((f) => (
                <div
                  key={f.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-100 hover:border-aims-navy/20 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                        f.on
                          ? "bg-aims-navy/10 text-aims-navy group-hover:bg-aims-navy group-hover:text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-extrabold text-slate-900">{f.name}</div>
                        {f.on && (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs md:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                        {f.desc}
                      </div>
                    </div>
                  </div>
                  <Switch checked={f.on} className="shrink-0 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-aims-navy data-[state=checked]:to-blue-700 data-[state=checked]:border-0 scale-110" />
                </div>
              ))}
            </CardContent>
            <CardFooter className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/70 flex-col md:flex-row gap-3 md:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Shield className="h-4 w-4 text-aims-navy" />
                Only administrators can modify these settings
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="lg" className="gap-2 h-11 border-slate-200">
                  <RefreshCw className="h-4 w-4" />
                  Revert
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => save("Features")}
                  className="gap-2 h-11 bg-gradient-to-r from-aims-navy to-blue-700 hover:from-aims-navy hover:to-blue-800 border-0 shadow-lg shadow-aims-navy/20"
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
