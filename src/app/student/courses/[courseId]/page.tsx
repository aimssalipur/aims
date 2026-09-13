"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileText
} from "lucide-react";
import { dummyCourses } from "@/lib/dummy-data";

export default function StudentCourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  
  // Database data
  const [youtubeResources, setYoutubeResources] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  
  // Active playing video state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  useEffect(() => {
    // 1. Resolve course details from dummyData first
    const resolvedCourse = dummyCourses.find((c) => c.id === courseId);
    if (resolvedCourse) {
      setCourse(resolvedCourse);
    } else {
      // Fallback
      setCourse(dummyCourses[0]);
    }

    // 2. Fetch resources from DB
    const fetchData = async () => {
      try {
        const [resVideos, resLive] = await Promise.all([
          fetch(`/api/courses/${courseId}/youtube-resources`),
          fetch(`/api/courses/${courseId}/live-classes`)
        ]);

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

  // Extract YouTube ID helper
  const getYoutubeId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const activeVideoId = selectedVideo ? getYoutubeId(selectedVideo.youtube_url) : "";

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
            <Card className="border-slate-100 overflow-hidden shadow-xl rounded-2xl">
              {/* YouTube secure wrapper */}
              <div className="relative aspect-video bg-black w-full overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId}?modestbranding=1&rel=0&disablekb=1&showinfo=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
                {/* Transparent overlay protecting video from direct clicks / link extraction */}
                <div 
                  className="absolute inset-0 w-full h-full bg-transparent pointer-events-auto"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ pointerEvents: 'none' }} /* Allows full controls while block right click via listener */
                />
              </div>
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
          ) : (
            <Card className="border-slate-100 p-12 text-center shadow-md bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
              <PlayCircle className="h-14 w-14 text-slate-300 mb-3" />
              <h3 className="font-extrabold text-slate-800 text-lg">No shared lectures yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">
                Your instructor hasn't uploaded any video content for this course yet.
              </p>
            </Card>
          )}

          {/* Secure Live Class List Section */}
          <Card className="border-slate-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 md:p-6 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-emerald-600 animate-pulse" />
                <CardTitle className="text-base font-extrabold text-slate-900">
                  Scheduled Secure Live Classes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {liveClasses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-semibold italic text-sm">
                  No live classes scheduled for this course.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {liveClasses.map((cls) => {
                    const status = getLiveClassStatus(cls);
                    return (
                      <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{cls.title}</span>
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
                              <Badge className="bg-slate-100 text-slate-500 text-[9px] font-extrabold border-0">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(cls.scheduled_start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(cls.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cls.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {status === "LIVE" ? (
                          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-md gap-1.5 animate-bounce">
                            <Link href={`/student/live/${cls.id}`}>
                              <Video className="h-3.5 w-3.5" /> Join Live Classroom
                            </Link>
                          </Button>
                        ) : status === "UPCOMING" ? (
                          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow gap-1.5">
                            <Link href={`/student/live/${cls.id}`}>
                              <Video className="h-3.5 w-3.5" /> Enter Classroom Early
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold h-9 px-3 rounded-xl">
                            <Link href={`/student/live/${cls.id}`}>
                              Re-enter Class
                            </Link>
                          </Button>
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
