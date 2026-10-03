"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquarePlus,
  CalendarDays,
  Pin,
  Trash2,
  Megaphone,
  Eye,
  Send,
  X,
  Loader2,
  RotateCw,
} from "lucide-react";
import { formatDate, initials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subscribeToDataRefresh, triggerDataRefresh } from "@/lib/refresh-event";

export default function InstructorAnnouncementsPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState({
    title: "",
    content: "",
    is_pinned: false,
  });
  const [preview, setPreview] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("Error loading announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchAnnouncements();
    });
  }, []);

  const publish = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter both a title and content before publishing.",
        variant: "destructive",
      });
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          content: draft.content.trim(),
          is_pinned: draft.is_pinned,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Publish Failed",
          description: data.error || "Unable to save announcement.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Announcement posted! 📢",
          description: `"${draft.title.slice(0, 30)}..." has been published.`,
          variant: "success",
        });
        setDraft({ title: "", content: "", is_pinned: false });
        setPreview(false);
        fetchAnnouncements();
        triggerDataRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Error publishing",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to delete",
          description: data.error || "Could not delete announcement.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Announcement deleted",
          description: "The announcement was removed successfully.",
          variant: "success",
        });
        fetchAnnouncements();
        triggerDataRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Announcements 📢
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Post important updates, circulars, and notices for your students
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-slate-100 overflow-hidden shadow-lg sticky top-24">
            <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-br from-aims-green/[0.08] to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-aims-green/15 text-aims-green flex items-center justify-center">
                  <MessageSquarePlus className="h-5.5 w-5.5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-extrabold">Compose Notice</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Visible to all enrolled students & faculty
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Notice Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Special Mock Test on Pediatric Nursing..."
                  className="h-12 text-sm font-semibold rounded-xl"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Content <span className="text-rose-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors ${
                      preview ? "bg-aims-navy/10 text-aims-navy" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <Eye className="h-3 w-3 inline mr-1" />
                    {preview ? "Edit" : "Preview"}
                  </button>
                </div>
                {preview ? (
                  <div className="min-h-[180px] p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                    {draft.title && (
                      <h4 className="font-extrabold text-base text-slate-900 mb-2">
                        {draft.title}
                      </h4>
                    )}
                    {draft.content ? (
                      <p className="text-slate-700 leading-relaxed text-xs whitespace-pre-wrap">
                        {draft.content}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-xs">
                        Start typing to see a preview...
                      </p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    rows={7}
                    placeholder="Write your announcement details here. Students will see this in their dashboard notices..."
                    className="resize-none text-xs sm:text-sm leading-relaxed rounded-xl"
                    value={draft.content}
                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.is_pinned}
                    onChange={(e) => setDraft({ ...draft, is_pinned: e.target.checked })}
                    className="rounded text-aims-green focus:ring-aims-green h-4 w-4"
                  />
                  Pin this announcement to top
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDraft({ title: "", content: "", is_pinned: false })}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <div className="flex-1" />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={publishing}
                  onClick={publish}
                  className="gap-1.5 h-10 px-5 rounded-xl bg-aims-green hover:bg-aims-green/90 shadow-lg shadow-aims-green/20 font-bold"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Publish Notice
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Published list */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Published Notices ({announcements.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              className="h-8 text-xs font-bold border-slate-200"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-aims-green" />
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-semibold">
                No announcements published yet. Write your first update on the left to notify all students.
              </div>
            ) : (
              announcements.map((ann) => (
                <Card
                  key={ann.id}
                  className={`overflow-hidden border-slate-100 group hover:shadow-lg transition-all ${
                    ann.is_pinned ? "ring-2 ring-aims-navy/20" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    {ann.is_pinned && (
                      <div className="bg-gradient-to-r from-aims-navy to-blue-700 px-4 py-1.5 flex items-center gap-2 text-white">
                        <Pin className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Pinned Notice
                        </span>
                      </div>
                    )}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold text-aims-green border-emerald-200 bg-emerald-50">
                              <Megaphone className="h-2.5 w-2.5 mr-1" />
                              Official Notice
                            </Badge>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {ann.created_at ? new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-snug">
                            {ann.title}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === ann.id}
                          onClick={() => handleDelete(ann.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                          title="Delete Notice"
                        >
                          {deletingId === ann.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
                        {ann.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Posted by: <strong className="text-slate-600">{ann.creator?.full_name || "Faculty / Admin"}</strong></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
