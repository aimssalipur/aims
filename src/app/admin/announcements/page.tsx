"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Send,
  Sparkles,
  BookOpen,
  CalendarDays,
  AlertCircle,
  Info,
  PartyPopper,
  Filter,
  Search,
} from "lucide-react";
import { dummyAnnouncements } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const categoryIcon: Record<string, any> = {
  Admission: Sparkles,
  Academic: BookOpen,
  Event: CalendarDays,
  Exam: AlertCircle,
  Info: Info,
  Celebration: PartyPopper,
};

const categoryBadge: Record<string, any> = {
  Admission: "warning",
  Academic: "default",
  Event: "secondary",
  Exam: "destructive",
  Info: "outline",
  Celebration: "gold",
};

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>(
    dummyAnnouncements.map((a, i) => ({
      ...a,
      category: ["Admission", "Event", "Academic", "Exam", "Celebration", "Info"][i % 6],
      priority: i === 0 ? "High" : "Normal",
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Academic",
    priority: "Normal",
    content: "",
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
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
    const newNotice = {
      id: `ann-${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      priority: form.priority,
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      setAnnouncements([newNotice, ...announcements]);
      setForm({
        title: "",
        category: "Academic",
        priority: "Normal",
        content: "",
      });
      setIsSubmitting(false);
      toast({
        title: "Announcement Published 📢",
        description: "Your circular has been broadcast to all students and faculty.",
        variant: "success",
      });
    }, 400);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast({
      title: "Notice Removed",
      description: "The announcement has been deleted.",
    });
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Category
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(val) => setForm({ ...form, category: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl text-sm">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Admission">Admission</SelectItem>
                        <SelectItem value="Exam">Exam / Test</SelectItem>
                        <SelectItem value="Event">Campus Event</SelectItem>
                        <SelectItem value="Celebration">Celebration</SelectItem>
                        <SelectItem value="Info">General Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Priority
                    </Label>
                    <Select
                      value={form.priority}
                      onValueChange={(val) => setForm({ ...form, priority: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl text-sm">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">Urgent / High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notice-content" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notice Details <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="notice-content"
                    placeholder="Write detailed instructions, dates, timings, or links for the students..."
                    className="min-h-[120px] rounded-xl text-sm p-3"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl gap-2 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Broadcasting..." : "Broadcast Notice"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Live Notice Feed */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search circulars..."
                className="pl-10 h-11 rounded-xl bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 rounded-xl sm:w-44 bg-white text-sm">
                <Filter className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Admission">Admission</SelectItem>
                <SelectItem value="Exam">Exam / Test</SelectItem>
                <SelectItem value="Event">Campus Event</SelectItem>
                <SelectItem value="Celebration">Celebration</SelectItem>
                <SelectItem value="Info">General Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredAnnouncements.length === 0 ? (
              <Card className="border-slate-100 p-12 text-center bg-white rounded-2xl">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-1">No announcements found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try adjusting your search or category filter, or post a new circular above.
                </p>
              </Card>
            ) : (
              filteredAnnouncements.map((item) => {
                const Icon = categoryIcon[item.category] || Megaphone;
                return (
                  <Card
                    key={item.id}
                    className="border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden bg-white group"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={categoryBadge[item.category]} className="text-[10px] font-bold px-2 py-0.5">
                            <Icon className="h-3 w-3 mr-1" />
                            {item.category}
                          </Badge>
                          {item.priority === "High" && (
                            <Badge variant="destructive" className="text-[9px] font-extrabold uppercase px-2 py-0.5">
                              Urgent
                            </Badge>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base mb-1.5 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
