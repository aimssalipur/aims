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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Megaphone,
  Trash2,
  Calendar,
  Send,
  GraduationCap,
  BookOpen,
  CalendarDays,
  AlertCircle,
  Info,
  PartyPopper,
  Filter,
  Search,
  Loader2,
  RotateCw,
  Pin,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { subscribeToDataRefresh, triggerDataRefresh } from "@/lib/refresh-event";

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    is_pinned: false,
  });

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
      console.error("Error fetching announcements:", err);
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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a title and message content for the circular.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          is_pinned: form.is_pinned,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Broadcast Failed",
          description: data.error || "Unable to save announcement.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Announcement Published 📢",
          description: "Your circular has been broadcast to all students and faculty.",
          variant: "success",
        });
        setForm({
          title: "",
          content: "",
          is_pinned: false,
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to delete",
          description: data.error || "Could not remove announcement.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Notice Removed",
          description: "The announcement has been deleted.",
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

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="h-3.5 w-3.5" />
            <span>Institute Communications</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Announcements &amp; Circulars 📢
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Broadcast urgent circulars, admissions alerts, and schedule changes across AIMS Salipur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnnouncements}
            className="h-9 gap-1.5 font-bold border-slate-200"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-white">
            {announcements.length} Total Notices
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left column: Broadcast Form */}
        <div className="lg:col-span-5">
          <Card className="border-slate-100 shadow-xl overflow-hidden sticky top-24 bg-white">
            <CardHeader className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-extrabold text-slate-900">
                    Publish New Notice
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Instantly broadcast updates to dashboards
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="notice-title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notice Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="notice-title"
                    placeholder="e.g. Schedule for Mock Exam Batch #4"
                    className="h-11 rounded-xl text-sm"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notice-content" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notice Details <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="notice-content"
                    placeholder="Write detailed instructions, dates, timings, or links for the students..."
                    className="min-h-[140px] rounded-xl text-sm p-3"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    Pin to top of student dashboard
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl gap-2 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Broadcast Notice
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Live Notice Feed */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search circulars..."
              className="pl-10 h-11 rounded-xl bg-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <Card className="border-slate-100 p-12 text-center bg-white rounded-2xl">
                <Loader2 className="h-6 w-6 text-amber-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Loading notices...</p>
              </Card>
            ) : filteredAnnouncements.length === 0 ? (
              <Card className="border-slate-100 p-12 text-center bg-white rounded-2xl">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-1">No announcements found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Post your first notice on the left to broadcast it to the platform.
                </p>
              </Card>
            ) : (
              filteredAnnouncements.map((item) => (
                <Card
                  key={item.id}
                  className={`border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden bg-white group ${
                    item.is_pinned ? "ring-2 ring-amber-500/20" : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.is_pinned && (
                          <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200">
                            <Pin className="h-3 w-3 mr-1 fill-current" />
                            Pinned
                          </Badge>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.created_at ? formatDate(item.created_at) : "—"}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notice"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                    <div className="pt-2 mt-2 border-t border-slate-50 text-[11px] text-slate-400">
                      Author: <strong className="text-slate-600">{item.creator?.full_name || "Admin"}</strong>
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
