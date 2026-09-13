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
  Edit3,
  Trash2,
  Megaphone,
  CheckCircle2,
  Eye,
  Send,
  Save,
  X,
} from "lucide-react";
import { dummyAnnouncements } from "@/lib/dummy-data";
import { formatDate, initials } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dummyInstructors } from "@/lib/dummy-data";

export default function InstructorAnnouncementsPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState({
    title: "",
    content: "",
  });
  const [preview, setPreview] = useState(false);

  const publish = () => {
    if (!draft.title || !draft.content) {
      toast({
        title: "Missing content",
        description: "Please add a title and content before publishing.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Announcement posted! 📢",
      description: `Your announcement "${draft.title.slice(0, 30)}..." has been published.`,
      variant: "success",
    });
    setDraft({ title: "", content: "" });
    setPreview(false);
  };

  const me = dummyInstructors[0];

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
                  <CardTitle className="text-lg font-extrabold">Compose New</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Visible to all enrolled students
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage src={me.avatar_url || ""} />
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                    {initials(me.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <div className="font-extrabold text-sm text-slate-900">
                    {me.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Posting as Instructor
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Class rescheduled to tomorrow..."
                  className="h-12 text-base font-semibold"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Content
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
                  <div className="min-h-[200px] p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                    {draft.title && (
                      <h4 className="font-extrabold text-lg text-slate-900 mb-2">
                        {draft.title}
                      </h4>
                    )}
                    {draft.content ? (
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                        {draft.content}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-sm">
                        Start typing to see a preview...
                      </p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    rows={9}
                    placeholder="Write your announcement here. Students will be notified via email and dashboard..."
                    className="resize-none text-sm leading-relaxed"
                    value={draft.content}
                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  />
                )}
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-1">
                  <span>{draft.content.length} characters</span>
                  <span>Supports plain text</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDraft({ title: "", content: "" })}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="gap-1.5 h-9 border-slate-200">
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={publish}
                  className="gap-1.5 h-9 bg-aims-green hover:bg-aims-green/90 shadow-lg shadow-aims-green/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Published list */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Published ({dummyAnnouncements.length})
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold">
                <Pin className="h-3 w-3 mr-1 fill-current" />
                Pinned · 1
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {dummyAnnouncements.map((ann, idx) => (
              <Card
                key={ann.id}
                className={`overflow-hidden border-slate-100 group hover:shadow-xl transition-all duration-300 ${
                  idx === 0 ? "ring-2 ring-aims-navy/10" : ""
                }`}
              >
                <CardContent className="p-0">
                  {idx === 0 && (
                    <div className="bg-gradient-to-r from-aims-navy to-blue-700 px-5 md:px-6 py-2 flex items-center gap-2 text-white">
                      <Pin className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        Pinned Announcement
                      </span>
                    </div>
                  )}
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white shadow-sm">
                          <AvatarImage src={me.avatar_url || ""} />
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                            {initials(me.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant={["warning", "default", "secondary", "destructive", "gold"][idx] as any}
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
                            >
                              <Megaphone className="h-3 w-3 mr-1" />
                              {["Admission", "Academic", "Event", "Exam", "Celebration"][idx]}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <Eye className="h-3 w-3" />
                              {[284, 210, 156, 302, 418][idx]} Views
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <CheckCircle2 className="h-3 w-3 text-aims-green" />
                              {[189, 156, 102, 220, 298][idx]} Read
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-snug mb-1.5 group-hover:text-aims-green transition-colors">
                            {ann.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                            <span>{me.full_name}</span>
                            <span className="text-slate-300">·</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(ann.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 md:mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg text-slate-400 hover:text-aims-navy hover:bg-aims-navy/10">
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg text-slate-400 hover:text-aims-green hover:bg-aims-green/10">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[15px]">
                      {ann.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button variant="outline" size="lg" className="gap-2 h-11 px-8 border-slate-200">
              Load More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
