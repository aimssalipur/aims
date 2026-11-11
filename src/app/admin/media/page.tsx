"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  FRONTEND_IMAGE_CATALOG,
  DEFAULT_FRONTEND_IMAGES,
  getSavedFrontendImages,
  saveFrontendImages,
  resetAllFrontendImages,
  FrontendImageItem,
} from "@/lib/frontend-images";
import { CoursePosterBanner } from "@/components/ui/course-poster-banner";
import { triggerDataRefresh } from "@/lib/refresh-event";
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Save,
  ExternalLink,
  CheckCircle2,
  LayoutTemplate,
  BookOpen,
  GraduationCap,
  Youtube,
  Instagram,
  Eye,
  Loader2,
} from "lucide-react";

// Curated high-res medical and healthcare presets for quick selection
const IMAGE_PRESETS: Record<string, { label: string; url: string }[]> = {
  hero: [
    {
      label: "Clinical Lab Training",
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
    },
    {
      label: "Modern Hospital Ward",
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop",
    },
    {
      label: "Doctor Mentoring Session",
      url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=800&fit=crop",
    },
  ],
  courses: [],
  testimonials: [
    {
      label: "Female Student (Smiling)",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    },
    {
      label: "Male Student (Professional)",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    },
    {
      label: "Female Candidate (Confident)",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    },
    {
      label: "Male Officer (Hospital Scrub)",
      url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop",
    },
  ],
  media: [
    {
      label: "AIMS Nursing Exam Prep (VIJWDvnelrA)",
      url: "https://img.youtube.com/vi/VIJWDvnelrA/maxresdefault.jpg",
    },
    {
      label: "AIMS Academy Sisua Salipur (1OuAlkKlDME)",
      url: "https://img.youtube.com/vi/1OuAlkKlDME/hqdefault.jpg",
    },
    {
      label: "AIMS Nursing Coaching (tAg5qCrAwe0)",
      url: "https://img.youtube.com/vi/tAg5qCrAwe0/hqdefault.jpg",
    },
  ],
};

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_FRONTEND_IMAGES);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("hero");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const local = getSavedFrontendImages();
    setImages(local);

    // Fetch live course thumbnails from database so admin media matches Supabase truth
    fetch("/api/admin/media")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.courseImages && Object.keys(data.courseImages).length > 0) {
          setImages((prev) => ({ ...prev, ...data.courseImages }));
        }
      })
      .catch((err) => console.error("Error loading server course thumbnails:", err));
  }, []);

  // Update single image URL
  const handleUrlChange = (id: string, newUrl: string) => {
    setImages((prev) => ({ ...prev, [id]: newUrl }));
    setDirtyKeys((prev) => new Set(prev).add(id));
  };

  // Reset single image
  const handleResetSingle = (id: string) => {
    const defaultUrl = DEFAULT_FRONTEND_IMAGES[id] || "";
    handleUrlChange(id, defaultUrl);
    toast({
      title: "Image Reverted",
      description: "Restored to default template photo.",
    });
  };

  // Upload image to Cloud / Supabase storage
  const handleFileUpload = async (id: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please choose a valid JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      if (data?.url) {
        handleUrlChange(id, data.url);
        toast({
          title: "Photo Uploaded! 📸",
          description: "Image uploaded to cloud storage. Click 'Save All Changes' to apply everywhere.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Note",
        description: err.message || "Could not upload image. You can also paste a direct image URL.",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  // Save all changes to localStorage AND synchronize courses to Supabase Database
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save locally for instant reactivity
      saveFrontendImages(images);

      // 2. Synchronize course covers to database so students & instructors see it everywhere
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to sync with database");
      }

      setDirtyKeys(new Set());
      triggerDataRefresh();

      toast({
        title: "Saved Everywhere! 🚀",
        description: "Images and course posters are now updated across the entire platform.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Saved Locally",
        description: err.message || "Saved in browser, but database sync had an issue.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset all to defaults
  const handleResetAll = async () => {
    resetAllFrontendImages();
    setImages(DEFAULT_FRONTEND_IMAGES);
    setDirtyKeys(new Set());

    try {
      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: DEFAULT_FRONTEND_IMAGES }),
      });
      triggerDataRefresh();
    } catch (e) {
      console.warn("Reset error:", e);
    }

    toast({
      title: "All Images Reset",
      description: "Every frontend section and course poster is back to defaults.",
    });
  };

  const getSectionItems = (section: FrontendImageItem["section"]) =>
    FRONTEND_IMAGE_CATALOG.filter((item) => item.section === section);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1250px] mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="h-9 w-9 rounded-xl bg-aims-navy/10 text-aims-navy flex items-center justify-center">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frontend Images &amp; Media
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
            Update any picture on the public website in real-time. Upload photos from your computer or paste image URLs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="h-10 gap-1.5 font-bold text-xs">
              <Eye className="h-4 w-4" />
              <span>Live Website</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="h-10 gap-1.5 font-bold text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset All
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={handleSaveAll}
            className="h-10 gap-2 font-bold text-xs shadow-md shadow-aims-navy/20 bg-aims-navy hover:bg-aims-navy-light"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving Everywhere..." : "Save Live Changes"}</span>
            {!saving && dirtyKeys.size > 0 && (
              <Badge className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0 text-[10px] ml-1">
                {dirtyKeys.size} Unsaved
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="hero"
            className="gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white"
          >
            <LayoutTemplate className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Course Covers ({getSectionItems("courses").length})
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white"
          >
            <Youtube className="h-4 w-4" />
            Media &amp; Instagram ({getSectionItems("media").length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        {(["hero", "courses", "media"] as const).map((section) => (
          <TabsContent key={section} value={section} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSectionItems(section).map((item) => (
                <ImageEditorCard
                  key={item.id}
                  item={item}
                  currentUrl={images[item.id] || item.defaultUrl}
                  isDirty={dirtyKeys.has(item.id)}
                  isUploading={uploadingId === item.id}
                  onUrlChange={(url) => handleUrlChange(item.id, url)}
                  onReset={() => handleResetSingle(item.id)}
                  onFileUpload={(file) => handleFileUpload(item.id, file)}
                  presets={IMAGE_PRESETS[section] || []}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ImageEditorCardProps {
  item: FrontendImageItem;
  currentUrl: string;
  isDirty: boolean;
  isUploading?: boolean;
  onUrlChange: (url: string) => void;
  onReset: () => void;
  onFileUpload: (file: File) => void;
  presets: { label: string; url: string }[];
}

function ImageEditorCard({
  item,
  currentUrl,
  isDirty,
  isUploading = false,
  onUrlChange,
  onReset,
  onFileUpload,
  presets,
}: ImageEditorCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card
      className={`overflow-hidden border transition-all duration-300 rounded-2xl sm:rounded-3xl ${
        isDirty
          ? "border-amber-400/80 shadow-lg shadow-amber-500/10"
          : "border-slate-200/80 shadow-sm hover:shadow-md"
      }`}
    >
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900">
                {item.label}
              </CardTitle>
              {isDirty && (
                <Badge className="bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0">
                  Modified
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {item.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-slate-500 shrink-0">
            {item.aspectRatio}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Live Visual Preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 group">
          <div
            className="w-full relative flex items-center justify-center"
            style={{
              aspectRatio: item.aspectRatio.replace("/", " / "),
              maxHeight: "220px",
            }}
          >
            {item.section === "courses" && (!currentUrl || currentUrl.includes("unsplash.com")) ? (
              <CoursePosterBanner
                title={item.label}
                thumbnailUrl=""
              />
            ) : (
              <img
                src={currentUrl || item.defaultUrl}
                alt={item.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = item.defaultUrl;
                }}
              />
            )}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Photo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
            />
          </div>
        </div>

        {/* Image URL Input */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">Image URL or Web Link</Label>
          <div className="flex gap-2">
            <Input
              value={currentUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="h-10 text-xs font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              title="Reset to default photo"
              className="h-10 px-3 shrink-0 text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Quick Presets */}
        {presets.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Suggestions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onUrlChange(preset.url)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    currentUrl === preset.url
                      ? "bg-aims-navy text-white border-aims-navy"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
