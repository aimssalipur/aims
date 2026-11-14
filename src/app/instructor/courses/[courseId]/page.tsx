"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Youtube,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  PlayCircle,
  Search,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Radio,
  Eye,
  Phone,
  Mail,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { extractYouTubeId } from "@/lib/youtube";
import { CoursePosterBanner } from "@/components/ui/course-poster-banner";
import { triggerDataRefresh } from "@/lib/refresh-event";

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [youtubeResources, setYoutubeResources] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialogs
  const [liveDialogOpen, setLiveDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);

  // Form states
  const [liveForm, setLiveForm] = useState({
    title: "",
    scheduled_start: "",
    scheduled_end: "",
    youtube_url: "",
  });
  const [scheduling, setScheduling] = useState(false);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    youtube_url: "",
    description: "",
  });
  const [addingResource, setAddingResource] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all course data
  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, resourcesRes, liveRes, enrollRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`, { cache: "no-store" }),
        fetch(`/api/courses/${courseId}/youtube-resources`, { cache: "no-store" }),
        fetch(`/api/courses/${courseId}/live-classes`, { cache: "no-store" }),
        fetch(`/api/admin/enrollments?course_id=${courseId}`, { cache: "no-store" }),
      ]);

      if (courseRes.ok) {
        const cData = await courseRes.json();
        setCourse(cData.course || null);
      }

      if (resourcesRes.ok) {
        const rData = await resourcesRes.json();
        const resList = Array.isArray(rData) ? rData : [];
        setYoutubeResources(resList);
        if (resList.length > 0) {
          setSelectedVideo(resList[0]);
        }
      }

      if (liveRes.ok) {
        const lData = await liveRes.json();
        setLiveClasses(Array.isArray(lData) ? lData : []);
      }

      if (enrollRes.ok) {
        const eData = await enrollRes.json();
        setEnrollments(Array.isArray(eData) ? eData : []);
      }
    } catch (err: any) {
      console.error("Error loading course details:", err);
      toast({
        title: "Failed to load course",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Live class status calculation
  const getLiveClassStatus = (classObj: any) => {
    const now = new Date();
    const start = new Date(classObj.scheduled_start);
    let end = new Date(classObj.scheduled_end);

    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(start.getTime() + 90 * 60 * 1000);
    }

    const thirtyMinsBefore = new Date(start.getTime() - 30 * 60 * 1000);
    const thirtyMinsAfter = new Date(end.getTime() + 30 * 60 * 1000);

    if (now >= thirtyMinsBefore && now <= thirtyMinsAfter) {
      return "LIVE";
    } else if (now > thirtyMinsAfter) {
      return "COMPLETED";
    } else {
      return "UPCOMING";
    }
  };

  // Filter students by search term
  const filteredEnrollments = useMemo(() => {
    if (!studentSearch.trim()) return enrollments;
    const q = studentSearch.toLowerCase();
    return enrollments.filter((e) => {
      const student = e.student;
      return (
        student?.full_name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        student?.whatsapp?.toLowerCase().includes(q)
      );
    });
  }, [enrollments, studentSearch]);

  // Handle Add YouTube Resource
  const handleAddResource = async () => {
    if (!resourceForm.title || !resourceForm.youtube_url) {
      toast({
        title: "Missing Fields",
        description: "Please provide a lecture title and YouTube link.",
        variant: "destructive",
      });
      return;
    }

    setAddingResource(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/youtube-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to Add Lecture",
          description: data.error || "Could not save lecture video.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lecture Added! 🎥",
          description: "Video is now accessible in the course content.",
          variant: "success",
        });
        setResourceForm({ title: "", youtube_url: "", description: "" });
        setResourceDialogOpen(false);
        loadCourseData();
        triggerDataRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add resource.",
        variant: "destructive",
      });
    } finally {
      setAddingResource(false);
    }
  };

  // Handle Delete YouTube Resource
  const handleDeleteResource = async (resourceId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lecture "${title}"?`)) return;

    setDeletingId(resourceId);
    try {
      const res = await fetch(`/api/courses/${courseId}/youtube-resources?id=${resourceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Lecture Removed",
          description: `"${title}" has been removed.`,
          variant: "success",
        });
        if (selectedVideo?.id === resourceId) {
          setSelectedVideo(null);
        }
        loadCourseData();
        triggerDataRefresh();
      } else {
        toast({
          title: "Delete Failed",
          description: "Could not delete this video.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Schedule Live Class
  const handleScheduleLiveClass = async () => {
    if (!liveForm.title || !liveForm.scheduled_start) {
      toast({
        title: "Missing Information",
        description: "Please enter a class title and start time.",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/live-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveForm),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to Schedule",
          description: data.error || "Could not schedule live session.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Live Class Scheduled! 🎙️",
          description: "Students can now see and join this live session.",
          variant: "success",
        });
        setLiveForm({ title: "", scheduled_start: "", scheduled_end: "", youtube_url: "" });
        setLiveDialogOpen(false);
        loadCourseData();
        triggerDataRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  // Handle Delete Live Class
  const handleDeleteLiveClass = async (classId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete live class "${title}"?`)) return;

    setDeletingId(classId);
    try {
      const res = await fetch(`/api/courses/${courseId}/live-classes?id=${classId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Live Class Removed",
          description: `"${title}" has been deleted.`,
          variant: "success",
        });
        loadCourseData();
        triggerDataRefresh();
      } else {
        toast({
          title: "Delete Failed",
          description: "Could not remove live class.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Link Copied!", description: "URL copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-aims-green" />
        <p className="text-slate-600 font-semibold text-sm">Loading course content & roster...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Course Not Found</h2>
        <p className="text-slate-600">The requested coaching course could not be located or was removed.</p>
        <Button asChild className="bg-aims-navy text-white">
          <Link href="/instructor/courses">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Manage Courses
          </Link>
        </Button>
      </div>
    );
  }

  const activeVideoId = selectedVideo ? extractYouTubeId(selectedVideo.youtube_url) : "";
  const totalClasses = liveClasses.length + youtubeResources.length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-aims-green transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manage Courses
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCourseData}
            className="h-9 gap-1.5 border-slate-200 hover:bg-slate-50 text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5 border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            <Link href={`/student/courses/${courseId}`} target="_blank">
              <Eye className="h-3.5 w-3.5 text-blue-600" />
              Preview Student View
              <ExternalLink className="h-3 w-3 text-slate-400 ml-0.5" />
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setLiveDialogOpen(true)}
            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
          >
            <Video className="h-3.5 w-3.5" />
            Schedule Live Class
          </Button>

          <Button
            size="sm"
            onClick={() => setResourceDialogOpen(true)}
            className="h-9 gap-1.5 bg-aims-navy hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
          >
            <Youtube className="h-3.5 w-3.5 text-red-400" />
            Upload IFrame Lecture
          </Button>
        </div>
      </div>

      {/* Course Overview Banner Card */}
      <Card className="border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-4 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-100 min-h-[220px]">
            <CoursePosterBanner
              title={course.title}
              thumbnailUrl={course.thumbnail_url}
              sizes="(max-width: 1024px) 100vw, 400px"
            />
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-emerald-600 text-white font-bold text-xs shadow-sm">
                Active Batch
              </Badge>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 sm:p-6 lg:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-aims-green uppercase tracking-wider mb-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Course Content & Roster Workspace
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {course.description || "No description entered for this course."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm">
                  {course.instructor?.full_name ? course.instructor.full_name[0] : "F"}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Faculty Lead</div>
                  <div className="text-sm font-extrabold text-slate-800">
                    {course.instructor?.full_name || "Unassigned"}
                  </div>
                </div>
              </div>

              {/* Matrix of counts */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-center min-w-[70px]">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-slate-400" /> Students
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {enrollments.length}
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2 text-center min-w-[70px]">
                  <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <Video className="h-3 w-3 text-emerald-600" /> Live
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-800 mt-0.5">
                    {liveClasses.length}
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 rounded-xl px-3 py-2 text-center min-w-[70px]">
                  <div className="text-[10px] font-bold text-rose-700 flex items-center justify-center gap-1">
                    <Youtube className="h-3 w-3 text-rose-600" /> IFrame
                  </div>
                  <div className="text-base sm:text-lg font-black text-rose-800 mt-0.5">
                    {youtubeResources.length}
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl px-3 py-2 text-center min-w-[70px]">
                  <div className="text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1">
                    <BookOpen className="h-3 w-3 text-emerald-400" /> Total
                  </div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">
                    {totalClasses}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabs Workspace */}
      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="w-full max-w-2xl grid grid-cols-4 bg-slate-100 p-1 rounded-xl h-11">
          <TabsTrigger value="lectures" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-aims-navy">
            <Youtube className="h-3.5 w-3.5 text-rose-600" />
            Lectures ({youtubeResources.length})
          </TabsTrigger>
          <TabsTrigger value="live" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-aims-navy">
            <Video className="h-3.5 w-3.5 text-emerald-600" />
            Live ({liveClasses.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-aims-navy">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            Students ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-aims-navy">
            <FileText className="h-3.5 w-3.5 text-slate-600" />
            Syllabus
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RECORDED LECTURES (YOUTUBE / IFRAME) */}
        <TabsContent value="lectures" className="space-y-6 pt-2">
          {/* Top Video Preview Player when a video is selected */}
          {selectedVideo && activeVideoId && (
            <Card className="border-slate-200 overflow-hidden shadow-sm bg-slate-950 text-white">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="border-rose-500/40 text-rose-400 text-[10px] font-bold mb-1">
                    Student Mode Preview
                  </Badge>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {selectedVideo.title}
                  </h3>
                  {selectedVideo.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedVideo.youtube_url, selectedVideo.id)}
                  className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-white text-xs h-8 gap-1.5"
                >
                  {copiedId === selectedVideo.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Video Link
                </Button>
              </div>

              <div className="relative aspect-video w-full max-w-4xl mx-auto bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </Card>
          )}

          {/* List of all uploaded IFrame / YouTube Lectures */}
          <Card className="border-slate-200">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-rose-600" />
                  Uploaded Video Lectures & IFrames
                </CardTitle>
                <CardDescription className="text-xs">
                  {youtubeResources.length} lectures currently uploaded for enrolled students.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setResourceDialogOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Lecture
              </Button>
            </CardHeader>

            <CardContent className="p-5">
              {youtubeResources.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <Youtube className="h-10 w-10 text-slate-400 mx-auto" />
                  <div className="font-extrabold text-slate-800 text-base">No video lectures uploaded yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Upload recorded class recordings or YouTube IFrame links so your students can study on-demand anytime.
                  </p>
                  <Button
                    onClick={() => setResourceDialogOpen(true)}
                    className="bg-aims-navy text-white text-xs font-bold gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Upload First Lecture
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeResources.map((item, idx) => {
                    const videoId = extractYouTubeId(item.youtube_url);
                    const isSelected = selectedVideo?.id === item.id;
                    const dateFormatted = item.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently uploaded";

                    return (
                      <Card
                        key={item.id}
                        className={`overflow-hidden transition-all duration-200 border ${
                          isSelected ? "border-aims-green ring-2 ring-aims-green/20 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Video thumbnail with play overlay */}
                        <div
                          onClick={() => setSelectedVideo(item)}
                          className="relative aspect-video bg-slate-900 cursor-pointer group overflow-hidden"
                        >
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <Youtube className="h-8 w-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-6 w-6 fill-rose-600 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Lecture #{youtubeResources.length - idx}
                          </div>
                        </div>

                        <CardContent className="p-3.5 space-y-2">
                          <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {dateFormatted}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copyToClipboard(item.youtube_url, item.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                                title="Copy Link"
                              >
                                {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteResource(item.id, item.title)}
                                disabled={deletingId === item.id}
                                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                                title="Delete Lecture"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: LIVE CLASSES */}
        <TabsContent value="live" className="space-y-6 pt-2">
          <Card className="border-slate-200">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Video className="h-5 w-5 text-emerald-600" />
                  Scheduled & Past Live Sessions
                </CardTitle>
                <CardDescription className="text-xs">
                  Conduct interactive live classes via OBS or YouTube Live for this course batch.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setLiveDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule Class
              </Button>
            </CardHeader>

            <CardContent className="p-5">
              {liveClasses.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <Video className="h-10 w-10 text-slate-400 mx-auto" />
                  <div className="font-extrabold text-slate-800 text-base">No live classes scheduled yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Set up your next interactive lecture. Students receive notifications and can join with one click.
                  </p>
                  <Button
                    onClick={() => setLiveDialogOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Schedule Next Live Class
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveClasses.map((item) => {
                    const status = getLiveClassStatus(item);
                    const isLive = status === "LIVE";
                    const isCompleted = status === "COMPLETED";

                    const startDate = item.scheduled_start
                      ? new Date(item.scheduled_start).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Unscheduled";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                          isLive
                            ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {isLive ? (
                              <Badge className="bg-red-600 text-white font-extrabold text-[10px] animate-pulse flex items-center gap-1">
                                <Radio className="h-3 w-3" /> LIVE NOW
                              </Badge>
                            ) : isCompleted ? (
                              <Badge variant="outline" className="text-slate-500 font-semibold text-[10px]">
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 font-bold text-[10px] border-amber-200">
                                Upcoming
                              </Badge>
                            )}
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {startDate}
                            </span>
                            {item.youtube_url && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Youtube className="h-3.5 w-3.5 text-rose-500" />
                                Stream Configured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.youtube_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 text-xs font-bold border-slate-200 hover:bg-slate-50 gap-1.5"
                            >
                              <a href={item.youtube_url} target="_blank" rel="noreferrer">
                                <Youtube className="h-3.5 w-3.5 text-rose-600" />
                                Watch Stream
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                              </a>
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingId === item.id}
                            onClick={() => handleDeleteLiveClass(item.id, item.title)}
                            className="h-8 text-xs px-2.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: ENROLLED STUDENTS ROSTER */}
        <TabsContent value="students" className="space-y-6 pt-2">
          <Card className="border-slate-200">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Enrolled Students ({filteredEnrollments.length} of {enrollments.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  All active candidates assigned to this course batch.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {filteredEnrollments.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                  <UserCheck className="h-10 w-10 text-slate-400 mx-auto" />
                  <div className="font-extrabold text-slate-800 text-base">
                    {studentSearch ? "No matching students found" : "No students enrolled yet"}
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {studentSearch
                      ? "Try searching with a different name or phone number."
                      : "Students enrolled via admission or the Admin panel will appear here automatically."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredEnrollments.map((item) => {
                    const s = item.student || {};
                    const joinDate = item.enrolled_at
                      ? new Date(item.enrolled_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Active";

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                            {s.full_name ? s.full_name.substring(0, 2).toUpperCase() : "ST"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {s.full_name || "Unnamed Student"}
                            </h4>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              {s.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          {s.whatsapp ? (
                            <a
                              href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" /> {s.whatsapp}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No phone</span>
                          )}
                          <span className="text-slate-400 text-[11px]">Joined {joinDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SYLLABUS & DETAILS */}
        <TabsContent value="syllabus" className="space-y-6 pt-2">
          <Card className="border-slate-200">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-aims-green" />
                Comprehensive Syllabus & Exam Blueprint
              </CardTitle>
              <CardDescription className="text-xs">
                Official syllabus, subjects, marking schemes, and exam pattern for this course.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {course.description || "No detailed syllabus has been posted for this course yet."}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Course Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Course ID:</span>{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">{course.id}</code>
                  </div>
                  <div>
                    <span className="text-slate-500">Faculty Assigned:</span>{" "}
                    <strong className="text-slate-800">{course.instructor?.full_name || "Unassigned"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Active Students:</span>{" "}
                    <strong className="text-emerald-700">{enrollments.length} Enrolled</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: SCHEDULE LIVE CLASS */}
      <Dialog open={liveDialogOpen} onOpenChange={setLiveDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Video className="h-5 w-5 text-emerald-400" />
              Schedule Live Class
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Schedule a live lecture for {course.title}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold text-slate-300">Class Topic / Title *</Label>
              <Input
                value={liveForm.title}
                onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                placeholder="e.g. Pediatric Nursing: Congenital Heart Defects"
                className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-slate-300">Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={liveForm.scheduled_start}
                  onChange={(e) => setLiveForm({ ...liveForm, scheduled_start: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-300">End Time (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={liveForm.scheduled_end}
                  onChange={(e) => setLiveForm({ ...liveForm, scheduled_end: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">YouTube Live URL or Stream Key</Label>
              <Input
                value={liveForm.youtube_url}
                onChange={(e) => setLiveForm({ ...liveForm, youtube_url: e.target.value })}
                placeholder="https://youtube.com/live/..."
                className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLiveDialogOpen(false)}
              className="bg-slate-800 border-slate-700 text-white text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleScheduleLiveClass}
              disabled={scheduling}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              {scheduling ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: UPLOAD YOUTUBE / IFRAME RESOURCE */}
      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Youtube className="h-5 w-5 text-rose-500" />
              Upload IFrame / YouTube Lecture
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Add a recorded video lecture for {course.title}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold text-slate-300">Lecture Title *</Label>
              <Input
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g. Unit 3: Pharmacology - Anti-Hypertensive Drugs"
                className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">YouTube URL or Video Link *</Label>
              <Input
                value={resourceForm.youtube_url}
                onChange={(e) => setResourceForm({ ...resourceForm, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">Topic Notes / Summary (Optional)</Label>
              <Textarea
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Brief notes, key points, or instructions for students..."
                rows={3}
                className="bg-slate-950 border-slate-800 text-white mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResourceDialogOpen(false)}
              className="bg-slate-800 border-slate-700 text-white text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddResource}
              disabled={addingResource}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {addingResource ? "Uploading..." : "Save Lecture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

