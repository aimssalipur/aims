"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedVideoPlayer } from "@/components/ui/protected-video-player";
import { createClient } from "@/lib/supabase/client";
import { extractYouTubeId } from "@/lib/youtube";
import { 
  PlayCircle, 
  Video, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Calendar, 
  ShieldAlert, 
  Loader2,
  Lock,
  Volume2,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function StudentCourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ name: string; email: string; phone?: string } | null>(null);
  
  // Database data
  const [youtubeResources, setYoutubeResources] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  
  // Active playing video state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase
          .from("profiles")
          .select("full_name, email, whatsapp")
          .eq("id", data.user.id)
          .single()
          .then(({ data: prof }) => {
            if (prof) {
              setStudentProfile({ name: prof.full_name, email: prof.email, phone: prof.whatsapp || "" });
            } else {
              setStudentProfile({ name: data.user.email || "Student", email: data.user.email || "" });
            }
          });
      }
    });
  }, [supabase]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCourse, resVideos, resLive] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/courses/${courseId}/youtube-resources`),
          fetch(`/api/courses/${courseId}/live-classes`),
        ]);

        if (resCourse.ok) {
          const courseData = await resCourse.json();
          if (courseData.course) {
            setCourse(courseData.course);
          }
        }

        // Enrollment restriction check
        if (resVideos.status === 403 || resLive.status === 403) {
          setIsRestricted(true);
          setLoading(false);
          return;
        }

        if (resVideos.ok) {
          const videos = await resVideos.json();
          setYoutubeResources(videos);
          if (videos.length > 0) {
            setSelectedVideo(videos[0]);
          }
        }
        
        if (resLive.ok) {
          const live = await resLive.json();
          setLiveClasses(live);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for new live classes every 15 seconds so students see live updates
    const pollInterval = setInterval(() => {
      fetch(`/api/courses/${courseId}/live-classes`)
        .then((res) => (res.ok ? res.json() : []))
        .then((live) => {
          if (Array.isArray(live)) setLiveClasses(live);
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [courseId]);

  const activeVideoId = selectedVideo ? extractYouTubeId(selectedVideo.youtube_url) : "";

  // Helper to determine if class is live now
  const getLiveClassStatus = (classObj: any) => {
    const now = new Date();
    const start = new Date(classObj.scheduled_start);
    let end = new Date(classObj.scheduled_end);

    // If end is invalid, before, or equal to start, extend to at least 90 minutes
    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(start.getTime() + 90 * 60 * 1000);
    }

    // A class is considered LIVE if:
    // Within 30 minutes before scheduled start up to 30 minutes after scheduled end
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

  // Group live classes date-wise
  const groupedLiveClasses = useMemo(() => {
    if (!liveClasses || liveClasses.length === 0) return [];

    // Sort newest to oldest so recent and upcoming classes are at the top
    const sorted = [...liveClasses].sort((a, b) => {
      return new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime();
    });

    const groupsMap = new Map<string, {
      dateKey: string;
      dateLabel: string;
      fullDayLabel: string;
      isToday: boolean;
      isYesterday: boolean;
      hasLive: boolean;
      classes: any[];
    }>();

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    sorted.forEach((cls) => {
      const classDate = new Date(cls.scheduled_start);
      if (isNaN(classDate.getTime())) return;

      const dateKey = `${classDate.getFullYear()}-${String(classDate.getMonth() + 1).padStart(2, "0")}-${String(classDate.getDate()).padStart(2, "0")}`;

      const dateLabel = classDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const fullDayLabel = classDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const status = getLiveClassStatus(cls);
      const isLive = status === "LIVE";

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, {
          dateKey,
          dateLabel,
          fullDayLabel,
          isToday: dateKey === todayStr,
          isYesterday: dateKey === yesterdayStr,
          hasLive: isLive,
          classes: [cls],
        });
      } else {
        const group = groupsMap.get(dateKey)!;
        if (isLive) group.hasLive = true;
        group.classes.push(cls);
      }
    });

    return Array.from(groupsMap.values());
  }, [liveClasses]);

  // Dropdown / Accordion state for date groups
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Auto-expand Today, Live, or the first group
  useEffect(() => {
    if (groupedLiveClasses.length === 0) return;

    setExpandedDates((prev) => {
      const next = { ...prev };
      let anyExpanded = Object.values(next).some(Boolean);

      groupedLiveClasses.forEach((group, index) => {
        if (next[group.dateKey] === undefined) {
          // Auto-expand if active live session, today, or top most recent date
          if (group.hasLive || group.isToday || (!anyExpanded && index === 0)) {
            next[group.dateKey] = true;
            anyExpanded = true;
          } else {
            next[group.dateKey] = false;
          }
        }
      });

      return next;
    });
  }, [groupedLiveClasses]);

  const toggleDateGroup = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const toggleAllDates = () => {
    const allExpanded = groupedLiveClasses.every((g) => expandedDates[g.dateKey]);
    const next: Record<string, boolean> = {};
    groupedLiveClasses.forEach((g) => {
      next[g.dateKey] = !allExpanded;
    });
    setExpandedDates(next);
  };

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto animate-pulse">
        {/* Header Breadcrumb Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-6 w-64 bg-slate-200 rounded" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-slate-100 shadow-xl rounded-2xl overflow-hidden bg-white">
              <div className="aspect-video bg-slate-200 w-full" />
              <div className="p-5 md:p-6 space-y-4">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                </div>
              </div>
            </div>

            {/* Live classes list skeleton */}
            <div className="border border-slate-100 shadow-lg rounded-2xl overflow-hidden bg-white">
              <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="h-5 w-48 bg-slate-200 rounded" />
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar column skeleton */}
          <div className="space-y-6">
            <div className="border border-slate-100 shadow-md rounded-2xl overflow-hidden bg-white">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <div className="h-5 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded mt-2" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-12 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div className="max-w-2xl mx-auto py-14 px-4 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-md">
          <Lock className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <Badge variant="warning" className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 border-amber-300">
            Access Restricted
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Course Not Assigned
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            You are not currently enrolled in <strong className="text-slate-900">{course?.title || "this course"}</strong>. Only courses assigned to you by the academy administration can be accessed.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="bg-aims-navy hover:bg-aims-navy/90 text-white font-bold rounded-xl h-11 px-5 shadow-md"
          >
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-11 px-5"
          >
            <a
              href={`https://wa.me/919437959054?text=${encodeURIComponent(
                `Hello AIMS Admissions, I would like to request enrollment in course: ${course?.title || courseId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Counselor on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl">
          <Link href="/student/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">COURSE CONSOLE</span>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
            {course?.title || "Course Details"}
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Main lecture viewer - left column */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVideo ? (
            <div className="space-y-6">
              {/* AIMS Protected Video Player (Shields against YouTube sharing, right click, and direct links) */}
              <ProtectedVideoPlayer
                videoId={activeVideoId}
                title={selectedVideo.title}
                watermark={studentProfile || undefined}
              />
              <Card className="border-slate-100 shadow-xl rounded-2xl">
                <CardHeader className="p-5 md:p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Badge variant="default" className="text-[10px] font-extrabold uppercase tracking-wider">
                        Now Streaming
                      </Badge>
                      <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 pt-1 leading-tight">
                        {selectedVideo.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                {selectedVideo.description && (
                  <CardContent className="p-6 pt-0 border-t border-slate-100 mt-2">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Lecture Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          ) : (
            <Card className="border-slate-100 p-12 text-center shadow-md bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
              <PlayCircle className="h-14 w-14 text-slate-300 mb-3" />
              <h3 className="font-extrabold text-slate-800 text-lg">No shared lectures yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">
                Your instructor hasn't uploaded any video content for this course yet.
              </p>
            </Card>
          )}

          {/* Secure Live Class List Section - Grouped Date-wise with Accordion Dropdown */}
          <Card className="border-slate-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-4 sm:p-5 bg-slate-50/50 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Video className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    Scheduled Secure Live Classes
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Organized date-wise • Tap any date to view sessions
                  </p>
                </div>
              </div>

              {groupedLiveClasses.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAllDates}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  {groupedLiveClasses.every((g) => expandedDates[g.dateKey])
                    ? "Collapse All"
                    : "Expand All"}
                </button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {groupedLiveClasses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-semibold italic text-sm">
                  No live classes scheduled for this course.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {groupedLiveClasses.map((group) => {
                    const isExpanded = !!expandedDates[group.dateKey];
                    return (
                      <div key={group.dateKey} className="transition-all">
                        {/* Dropdown / Accordion Trigger Header */}
                        <button
                          type="button"
                          onClick={() => toggleDateGroup(group.dateKey)}
                          className="w-full p-4 sm:p-4.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                group.hasLive
                                  ? "bg-red-50 text-red-600"
                                  : group.isToday
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Calendar className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                                  {group.fullDayLabel}
                                </span>
                                {group.isToday && (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border-emerald-200">
                                    TODAY
                                  </Badge>
                                )}
                                {group.isYesterday && (
                                  <Badge variant="outline" className="text-slate-500 text-[9px] font-bold">
                                    YESTERDAY
                                  </Badge>
                                )}
                                {group.hasLive && (
                                  <Badge className="bg-red-600 text-white animate-pulse text-[9px] font-extrabold border-0 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> LIVE NOW
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                {group.classes.length} {group.classes.length === 1 ? "session" : "sessions"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                              {isExpanded ? "Hide" : "View"}
                            </span>
                            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-slate-50/50 border-t border-slate-100 pl-4 sm:pl-16 pr-4 sm:pr-6 py-1">
                            {group.classes.map((cls) => {
                              const status = getLiveClassStatus(cls);
                              return (
                                <div
                                  key={cls.id}
                                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-900 text-sm truncate">
                                        {cls.title}
                                      </span>
                                      {status === "LIVE" && (
                                        <Badge className="bg-emerald-500 text-white animate-pulse text-[9px] font-extrabold border-0">
                                          LIVE NOW
                                        </Badge>
                                      )}
                                      {status === "UPCOMING" && (
                                        <Badge variant="outline" className="text-slate-500 text-[9px] font-extrabold">
                                          UPCOMING
                                        </Badge>
                                      )}
                                      {status === "COMPLETED" && (
                                        <Badge className="bg-slate-200 text-slate-600 text-[9px] font-extrabold border-0">
                                          COMPLETED
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                                      <span>
                                        {new Date(cls.scheduled_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        {" - "}
                                        {new Date(cls.scheduled_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {status === "LIVE" ? (
                                      <Button
                                        asChild
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-8.5 px-4 rounded-xl shadow-md gap-1.5 animate-bounce"
                                      >
                                        <Link href={`/student/live/${cls.id}`}>
                                          <Video className="h-3.5 w-3.5" /> Join Live Classroom
                                        </Link>
                                      </Button>
                                    ) : status === "UPCOMING" ? (
                                      <Button
                                        asChild
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs h-8.5 px-4 rounded-xl shadow gap-1.5"
                                      >
                                        <Link href={`/student/live/${cls.id}`}>
                                          <Video className="h-3.5 w-3.5" /> Enter Classroom Early
                                        </Link>
                                      </Button>
                                    ) : (
                                      <Button
                                        asChild
                                        variant="outline"
                                        className="border-slate-200 text-slate-600 hover:bg-white text-xs font-bold h-8 px-3 rounded-xl shadow-2xs"
                                      >
                                        <Link href={`/student/live/${cls.id}`}>
                                          Re-enter Class
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Lecture Playlist - right column */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-aims-navy" />
                <CardTitle className="text-base font-extrabold text-slate-900">
                  Course Lectures
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Select a shared lecture to stream in the secure video player.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              {youtubeResources.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 italic font-semibold">No recorded lectures shared.</p>
              ) : (
                <div className="grid gap-1">
                  {youtubeResources.map((video, idx) => {
                    const isSelected = selectedVideo?.id === video.id;
                    return (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex gap-3 items-start ${
                          isSelected 
                            ? "bg-aims-navy/5 text-aims-navy border border-aims-navy/10" 
                            : "hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                          isSelected ? "bg-aims-navy text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          <PlayCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold leading-snug line-clamp-2">
                            {video.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">
                            Lecture {youtubeResources.length - idx}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {course?.exam_pattern && (
            <Card className="border-slate-100 shadow-md rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-aims-green" />
                  <CardTitle className="text-base font-extrabold text-slate-900">
                    Exam Pattern & Syllabus
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">
                  Official marking scheme and syllabus breakdown.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 max-h-[450px] overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Marks</span>
                    <span className="text-slate-900 font-extrabold text-sm">{course.exam_pattern.total_marks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Questions</span>
                    <span className="text-slate-900 font-extrabold text-sm">{course.exam_pattern.total_questions}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span>
                    <span className="text-slate-900 font-extrabold text-sm">{course.exam_pattern.duration}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Negative Mark</span>
                    <span className="text-slate-900 font-extrabold text-sm">{course.exam_pattern.negative_marking}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Subject Breakdown</h4>
                  {course.exam_pattern.sections.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-1 bg-slate-50/30 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                        <span className="pr-2">{section.name}</span>
                        {section.marks && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold shrink-0">
                            {section.marks}
                          </Badge>
                        )}
                        {section.questions && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold shrink-0">
                            {section.questions}
                          </Badge>
                        )}
                      </div>
                      
                      {section.topics && (
                        <ul className="list-disc pl-4 text-[11px] text-slate-500 font-medium space-y-0.5 pt-1.5">
                          {section.topics.map((topic: string, tIdx: number) => (
                            <li key={tIdx}>{topic}</li>
                          ))}
                        </ul>
                      )}

                      {section.subsections && (
                        <div className="space-y-2 pt-2 pl-2 border-l border-slate-200">
                          {section.subsections.map((sub: any, subIdx: number) => (
                            <div key={subIdx} className="space-y-0.5">
                              <div className="flex justify-between text-[11.5px] font-bold text-slate-700">
                                <span className="pr-2">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold shrink-0">{sub.questions}</span>
                              </div>
                              {sub.topics && (
                                <ul className="list-disc pl-4 text-[10.5px] text-slate-500 font-medium space-y-0.5">
                                  {sub.topics.map((topic: string, tIdx: number) => (
                                    <li key={tIdx}>{topic}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
