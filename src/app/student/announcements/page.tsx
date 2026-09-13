"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dummyAnnouncements, dummyInstructors } from "@/lib/dummy-data";
import {
  Bell,
  Megaphone,
  BookOpen,
  CalendarDays,
  Clock,
  Sparkles,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Calendar,
  AlertCircle,
  Info,
  PartyPopper,
  Download,
  Eye,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const announceTypeIcon: Record<string, any> = {
  Admission: Sparkles,
  Academic: BookOpen,
  Event: CalendarDays,
  Exam: AlertCircle,
  Info: Info,
  Celebration: PartyPopper,
};
const announceTypeVariant: Record<string, any> = {
  Admission: "warning",
  Academic: "default",
  Event: "secondary",
  Exam: "destructive",
  Info: "outline",
  Celebration: "gold",
};

export default function StudentAnnouncementsPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [activeDialogAnn, setActiveDialogAnn] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const rawAnnouncements = dummyAnnouncements.map((a, i) => ({
    ...a,
    author:
      i % 2 === 0
        ? { full_name: "AIMS Admin", avatar_url: undefined, role: "admin" }
        : dummyInstructors[i % dummyInstructors.length],
    type: ["Admission", "Event", "Academic", "Exam", "Celebration", "Info"][i % 6],
  }));

  const filteredAnnouncements = rawAnnouncements.filter((a) => {
    if (activeFilter === "Academic") return a.type === "Academic" || a.type === "Exam";
    if (activeFilter === "Events") return a.type === "Event" || a.type === "Celebration";
    if (activeFilter === "Admissions") return a.type === "Admission";
    return true;
  });

  const displayedAnnouncements = filteredAnnouncements.slice(0, visibleCount);

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((b) => b !== id));
      toast({ title: "Bookmark removed" });
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      toast({
        title: "Announcement Bookmarked 🔖",
        description: "Saved to your reading list for quick reference.",
        variant: "success",
      });
    }
  };

  const handleShare = async (ann: any) => {
    const shareData = {
      title: ann.title,
      text: `${ann.title} - AIMS Salipur announcement`,
      url: typeof window !== "undefined" ? window.location.href : "https://aimssalipur.com",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* noop */
      }
    } else {
      navigator.clipboard.writeText(`${ann.title}\n\n${ann.content}`);
      toast({
        title: "Copied to Clipboard 📋",
        description: "Notice summary copied. You can paste and share with friends.",
      });
    }
  };

  const handleDownloadPDF = (ann: any) => {
    const element = document.createElement("a");
    const file = new Blob([`${ann.title}\nDate: ${formatDate(ann.created_at)}\nAuthor: ${ann.author?.full_name}\nCategory: ${ann.type}\n\n${ann.content}\n\n--- AIMS Salipur Official Circular ---`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${ann.title.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}_Circular.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Notice Downloaded 📄",
      description: "Official announcement text saved to your downloads.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-aims-navy via-blue-800 to-aims-navy p-6 md:p-8 lg:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-aims-green/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-aims-gold/15 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit">
              <Bell className="h-3 w-3 mr-1.5" /> {rawAnnouncements.length} Updates
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Announcements &amp; Updates 📢
            </h1>
            <p className="text-white/80 max-w-xl text-base leading-relaxed">
              Stay informed with the latest news, circulars, and important
              updates from the institute. Don&apos;t miss anything important!
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md w-full md:w-auto">
            {[
              { label: "New Today", value: 2, color: "bg-emerald-400/20 text-emerald-100" },
              { label: "This Week", value: 4, color: "bg-white/15 text-white" },
              { label: "Saved", value: bookmarkedIds.length, color: "bg-amber-400/20 text-amber-100" },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl p-4 md:p-5 backdrop-blur border border-white/15 ${s.color}`}
              >
                <div className="text-2xl md:text-3xl font-extrabold">{s.value}</div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "All", count: rawAnnouncements.length },
          { label: "Academic", count: rawAnnouncements.filter((a) => a.type === "Academic" || a.type === "Exam").length },
          { label: "Events", count: rawAnnouncements.filter((a) => a.type === "Event" || a.type === "Celebration").length },
          { label: "Admissions", count: rawAnnouncements.filter((a) => a.type === "Admission").length },
        ].map((filter) => {
          const isSelected = activeFilter === filter.label;
          return (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isSelected
                  ? "bg-aims-navy text-white shadow-md shadow-aims-navy/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-aims-navy/30 hover:bg-aims-navy/5"
              }`}
            >
              {filter.label}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-5">
        {displayedAnnouncements.map((ann, idx) => {
          const Icon = announceTypeIcon[ann.type] || Megaphone;
          const isBookmarked = bookmarkedIds.includes(ann.id);

          return (
            <Card
              key={ann.id}
              className={`group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 ${
                idx === 0 ? "ring-2 ring-aims-navy/10" : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Left accent bar */}
                  <div
                    className={`w-1.5 shrink-0 ${
                      ann.type === "Exam"
                        ? "bg-gradient-to-b from-red-400 to-red-600"
                        : ann.type === "Admission"
                        ? "bg-gradient-to-b from-amber-400 to-amber-600"
                        : ann.type === "Celebration"
                        ? "bg-gradient-to-b from-pink-400 to-purple-600"
                        : ann.type === "Event"
                        ? "bg-gradient-to-b from-aims-green to-emerald-600"
                        : "bg-gradient-to-b from-aims-navy to-blue-700"
                    }`}
                  />
                  <div className="flex-1 p-5 md:p-7">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 shrink-0 ring-2 ring-white shadow-md">
                          <AvatarImage src={ann.author?.avatar_url || ""} />
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                            {ann.author?.full_name
                              ? ann.author.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)
                              : "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant={announceTypeVariant[ann.type]}
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {ann.type}
                            </Badge>
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-600 animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                New
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug mb-1.5 group-hover:text-aims-navy transition-colors">
                            {ann.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              {ann.author?.full_name || "AIMS Admin"}
                              <span className="text-slate-300">·</span>
                              <span className="capitalize text-slate-500/80">
                                {ann.author?.role || "Administration"}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(ann.created_at)}
                            </span>
                            <span className="flex items-center gap-1 hidden sm:inline-flex">
                              <Clock className="h-3 w-3" />
                              2 min read
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 md:mt-1.5">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(ann.id)}
                          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                            isBookmarked
                              ? "bg-amber-100 text-amber-600"
                              : "text-slate-400 hover:text-aims-navy hover:bg-aims-navy/5"
                          }`}
                          title={isBookmarked ? "Remove bookmark" : "Bookmark announcement"}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-4.5 w-4.5" />
                          ) : (
                            <BookmarkPlus className="h-4.5 w-4.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(ann)}
                          className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Share announcement"
                        >
                          <Share2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                    <div className="pl-0 md:pl-16">
                      <p className="text-slate-600 leading-relaxed text-[15px] mb-4">
                        {ann.content}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActiveDialogAnn(ann)}
                          className="inline-flex items-center gap-2 px-4 h-9 rounded-xl bg-aims-navy/10 hover:bg-aims-navy/15 text-aims-navy font-bold text-sm transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Read Full Announcement
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(ann)}
                          className="inline-flex items-center gap-2 px-4 h-9 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-sm text-slate-600 transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Notice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load more button */}
      {visibleCount < filteredAnnouncements.length && (
        <div className="text-center pt-4 pb-8">
          <button
            type="button"
            onClick={() => {
              setVisibleCount((prev) => prev + 5);
              toast({ title: "Earlier circulars loaded 📰" });
            }}
            className="inline-flex items-center gap-2 px-6 h-12 rounded-2xl border-2 border-slate-200 hover:border-aims-navy/30 hover:bg-aims-navy/5 font-bold text-slate-700 transition-all cursor-pointer"
          >
            Load Earlier Announcements
          </button>
        </div>
      )}

      {/* Full announcement dialog modal */}
      <Dialog open={!!activeDialogAnn} onOpenChange={(open) => !open && setActiveDialogAnn(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {activeDialogAnn && (
                <Badge variant={announceTypeVariant[activeDialogAnn.type]}>
                  {activeDialogAnn.type}
                </Badge>
              )}
              <span className="text-xs text-slate-400">
                {activeDialogAnn && formatDate(activeDialogAnn.created_at)}
              </span>
            </div>
            <DialogTitle className="text-xl font-extrabold leading-snug">
              {activeDialogAnn?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Published by {activeDialogAnn?.author?.full_name || "AIMS Administration"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-slate-700 leading-relaxed text-sm whitespace-pre-line border-y border-slate-100 my-2">
            {activeDialogAnn?.content}
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPDF(activeDialogAnn)}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" /> Download Notice
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveDialogAnn(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
