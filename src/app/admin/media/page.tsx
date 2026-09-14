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
  courses: [
    {
      label: "Nurse with Stethoscope",
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
    },
    {
      label: "Intensive Care Station",
      url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60",
    },
    {
      label: "Medical Lecture Hall",
      url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60",
    },
    {
      label: "Operation Theater Demo",
      url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=60",
    },
  ],
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
      label: "YouTube Studio Demo",
      url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=675&fit=crop",
    },
    {
      label: "Campus Garden & Library",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=800&fit=crop",
    },
    {
      label: "Students Group Discussion",
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=800&fit=crop",
    },
  ],
};

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_FRONTEND_IMAGES);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    setImages(getSavedFrontendImages());
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

  // Upload image from user's computer
  const handleFileUpload = (id: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please choose a valid JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64 compressed data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Compress large images via client-side canvas
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          handleUrlChange(id, compressed);
          toast({
            title: "Photo Uploaded! 📸",
            description: "Your local image was compressed and ready to save.",
            variant: "success",
          });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Save all changes
  const handleSaveAll = () => {
    saveFrontendImages(images);
    setDirtyKeys(new Set());
    toast({
      title: "Frontend Images Updated",
      description: "All changes are now live on the public landing page.",
      variant: "success",
    });
  };

  // Reset all to defaults
  const handleResetAll = () => {
    resetAllFrontendImages();
    setImages(DEFAULT_FRONTEND_IMAGES);
    setDirtyKeys(new Set());
    toast({
      title: "All Images Reset",
      description: "Every frontend section is back to default photos.",
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
            onClick={handleSaveAll}
            className="h-10 gap-2 font-bold text-xs shadow-md shadow-aims-navy/20 bg-aims-navy hover:bg-aims-navy-light"
          >
            <Save className="h-4 w-4" />
            <span>Save Live Changes</span>
            {dirtyKeys.size > 0 && (
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
            value="testimonials"
            className="gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            Student Testimonials ({getSectionItems("testimonials").length})
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
        {(["hero", "courses", "testimonials", "media"] as const).map((section) => (
          <TabsContent key={section} value={section} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSectionItems(section).map((item) => (
                <ImageEditorCard
                  key={item.id}
                  item={item}
                  currentUrl={images[item.id] || item.defaultUrl}
                  isDirty={dirtyKeys.has(item.id)}
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
  onUrlChange: (url: string) => void;
  onReset: () => void;
  onFileUpload: (file: File) => void;
  presets: { label: string; url: string }[];
}

function ImageEditorCard({
  item,
  currentUrl,
  isDirty,
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
            <img
              src={currentUrl}
              alt={item.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = item.defaultUrl;
              }}
            />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
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
