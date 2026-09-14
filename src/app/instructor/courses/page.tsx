"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileEdit,
  Plus,
  Users,
  Trash2,
  PlayCircle,
  Upload,
  Youtube,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  Video,
  ExternalLink,
  Calendar,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dummyCourses } from "@/lib/dummy-data";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function InstructorCoursesPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data?.url) {
        setCourseForm((prev) => ({ ...prev, thumbnail_url: data.url }));
        toast({
          title: "Thumbnail Uploaded! 📸",
          description: "Image successfully stored on Cloudinary.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Could not upload image to Cloudinary",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Live Class Scheduling & Management Dialog State
  const [liveDialogOpen, setLiveDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [liveClassForm, setLiveClassForm] = useState({
    title: "",
    scheduled_start: "",
    scheduled_end: ""
  });
  const [scheduling, setScheduling] = useState(false);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // YouTube Resource Management Dialog State
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    youtube_url: "",
    description: ""
  });
  const [loadingResources, setLoadingResources] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  // Local courses mapping
  const myCourses = dummyCourses
    .filter((_, i) => i % 2 === 0)
    .map((c, i) => ({
      ...c,
      enrolled: [42, 38, 35, 29][i],
      avgProgress: [62, 48, 75, 33][i],
      lectures: [48, 36, 42, 28][i],
    }));

  // Fetch YouTube resources for a selected course
  const fetchResources = async (courseId: string) => {
    setLoadingResources(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/youtube-resources`);
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoadingResources(false);
    }
  };

  // Fetch scheduled live classes for a course
  const fetchLiveClasses = async (courseId: string) => {
    setLoadingLiveClasses(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/live-classes`);
      if (res.ok) {
        const data = await res.json();
        setLiveClasses(data);
      }
    } catch (err) {
      console.error("Error fetching live classes:", err);
    } finally {
      setLoadingLiveClasses(false);
    }
  };

  const handleOpenLiveDialog = (course: any) => {
    setSelectedCourse(course);
    setLiveClasses([]);
    setShowScheduleForm(false);
    setLiveDialogOpen(true);
    fetchLiveClasses(course.id);
  };

  const handleOpenResourceDialog = (course: any) => {
    setSelectedCourse(course);
    setResourceDialogOpen(true);
    fetchResources(course.id);
  };

  const handleScheduleLive = async () => {
    if (!liveClassForm.title || !liveClassForm.scheduled_start || !liveClassForm.scheduled_end) {
      toast({
        title: "Missing details",
        description: "Please fill out all live class details.",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/live-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveClassForm)
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Failed to schedule live class",
          description: data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Live Class Scheduled! 🎙️",
          description: "Students are now notified and can join at the scheduled time.",
          variant: "success"
        });
        setLiveClassForm({ title: "", scheduled_start: "", scheduled_end: "" });
        setShowScheduleForm(false);
        fetchLiveClasses(selectedCourse.id);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleAddResource = async () => {
    if (!resourceForm.title || !resourceForm.youtube_url) {
      toast({
        title: "Missing fields",
        description: "Please enter a title and YouTube link.",
        variant: "destructive",
      });
      return;
    }

    setAddingResource(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/youtube-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm)
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Failed to add video resource",
          description: data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Resource Added! 🎥",
          description: "YouTube link successfully shared in the student panel.",
          variant: "success"
        });
        setResourceForm({ title: "", youtube_url: "", description: "" });
        fetchResources(selectedCourse.id);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setAddingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to remove this lecture video?")) return;

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/youtube-resources?id=${resourceId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast({
          title: "Resource Deleted",
          description: "Lecture video removed successfully.",
          variant: "success"
        });
        fetchResources(selectedCourse.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage My Courses 📝
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            {myCourses.length} active courses · {myCourses.reduce((a, b) => a + b.enrolled, 0)} total students
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" size="lg" className="gap-2 h-11 bg-aims-green hover:bg-aims-green/90 shadow-lg shadow-aims-green/20">
              <Plus className="h-4.5 w-4.5" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course. You can edit details later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 py-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>Course Title</Label>
                <Input 
                  placeholder="e.g. Advanced Pediatric Care" 
                  className="h-11" 
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea 
                  rows={3} 
                  placeholder="Brief summary of the course..." 
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Thumbnail Image</Label>
                <div className="relative flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-aims-navy/30 bg-slate-50/50 cursor-pointer">
                  {courseForm.thumbnail_url ? (
                    <div className="relative h-14 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white">
                      <Image
                        src={courseForm.thumbnail_url}
                        alt="Course Thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                      {uploadingImage ? (
                        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 mb-1">
                      {uploadingImage ? "Uploading thumbnail..." : courseForm.thumbnail_url ? "Replace Thumbnail" : "Click to upload"}
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB · 16:9 ratio</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={() => {
                setDialogOpen(false);
                setCourseForm({ title: "", description: "", thumbnail_url: "" });
              }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={uploadingImage || !courseForm.title}
                onClick={() => {
                  setDialogOpen(false);
                  toast({
                    title: "Course created successfully",
                    description: `New course "${courseForm.title}" added successfully.`,
                    variant: "success",
                  });
                  setCourses((prev) => [
                    ...prev,
                    {
                      id: `c_user_${Date.now()}`,
                      title: courseForm.title,
                      description: courseForm.description,
                      thumbnail_url: courseForm.thumbnail_url || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop",
                      created_at: new Date().toISOString(),
                    }
                  ]);
                  setCourseForm({ title: "", description: "", thumbnail_url: "" });
                }}
              >
                Create Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myCourses.map((course, idx) => (
          <Card
            key={course.id}
            className="group overflow-hidden border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
          >
            <div className="relative overflow-hidden aspect-[16/10]">
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge
                  variant={["default", "secondary", "warning", "gold"][idx] as any}
                  className="text-xs font-bold px-3 py-1 shadow-sm border-0"
                >
                  {["Active", "Active", "Active", "Draft"][idx]}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                      <MoreHorizontal className="h-4.5 w-4.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem className="gap-2" onClick={() => handleOpenLiveDialog(course)}>
                      <Video className="h-4 w-4 text-emerald-600" /> Schedule Live Class
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => handleOpenResourceDialog(course)}>
                      <Youtube className="h-4 w-4 text-red-500" /> YouTube Lectures
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                      <FileEdit className="h-4 w-4" /> Edit Course Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3 text-xs font-bold drop-shadow-md">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.enrolled} Enrolled
                  </span>
                </div>
                <div className="text-lg font-extrabold drop-shadow-md">
                  {course.avgProgress}% avg
                </div>
              </div>
            </div>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-extrabold leading-tight line-clamp-2 group-hover:text-aims-green transition-colors">
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 flex-1">
              <CardDescription className="text-sm text-slate-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {course.description}
              </CardDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Student Completion Rate
                  </span>
                  <span className="text-emerald-600 font-extrabold">{course.avgProgress}%</span>
                </div>
                <Progress value={course.avgProgress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 mt-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleOpenLiveDialog(course)}
                className="flex-1 gap-2 h-10 border-slate-200 hover:bg-slate-50 font-bold text-xs"
              >
                <Video className="h-3.5 w-3.5 text-emerald-600" />
                Live Session
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleOpenResourceDialog(course)}
                className="flex-1 gap-2 h-10 border-slate-200 hover:bg-slate-50 font-bold text-xs"
              >
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                Upload IFrame
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Manage Live Classes Dialog */}
      <Dialog open={liveDialogOpen} onOpenChange={setLiveDialogOpen}>
        <DialogContent className="max-w-xl bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Video className="h-5 w-5 text-emerald-400" />
              {showScheduleForm ? "Schedule New Live Class" : "Manage Live Sessions"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {showScheduleForm 
                ? `Schedule a free and secure Jitsi live class for ${selectedCourse?.title}.`
                : `Manage and host live lectures for ${selectedCourse?.title}.`
              }
            </DialogDescription>
          </DialogHeader>

          {!showScheduleForm ? (
            <div className="space-y-4 py-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                <Label className="text-slate-300 font-bold">Active live lectures ({liveClasses.length})</Label>
                {loadingLiveClasses ? (
                  <div className="text-center py-4 text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading live lectures...
                  </div>
                ) : liveClasses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No live classes scheduled for this course yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {liveClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{cls.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(cls.scheduled_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <Button 
                          asChild
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-3 rounded-lg flex items-center gap-1.5"
                        >
                          <Link href={`/instructor/live/${cls.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" /> Start Host
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="pt-2 flex justify-between gap-2 flex-col sm:flex-row">
                <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-white" onClick={() => setLiveDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold" 
                  onClick={() => setShowScheduleForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Schedule New Class
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 font-bold">Class Information</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, "0");
                      const startIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                      const endIso = `${oneHourLater.getFullYear()}-${pad(oneHourLater.getMonth() + 1)}-${pad(oneHourLater.getDate())}T${pad(oneHourLater.getHours())}:${pad(oneHourLater.getMinutes())}`;
                      setLiveClassForm({
                        title: liveClassForm.title || `Live Session - ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                        scheduled_start: startIso,
                        scheduled_end: endIso,
                      });
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2"
                  >
                    <Video className="h-3 w-3" /> Go Live Right Now (Auto-fill)
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold">Class Title</Label>
                  <Input 
                    placeholder="e.g. Chapter 4: Pediatric Emergencies" 
                    className="bg-slate-950 border-slate-800 text-white h-11"
                    value={liveClassForm.title}
                    onChange={(e) => setLiveClassForm({...liveClassForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold">Start Time</Label>
                  <Input 
                    type="datetime-local" 
                    className="bg-slate-950 border-slate-800 text-white h-11 [color-scheme:dark]"
                    value={liveClassForm.scheduled_start}
                    onChange={(e) => {
                      const startVal = e.target.value;
                      let endVal = liveClassForm.scheduled_end;
                      if (startVal && (!endVal || endVal <= startVal)) {
                        const startDate = new Date(startVal);
                        if (!isNaN(startDate.getTime())) {
                          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                          const pad = (n: number) => String(n).padStart(2, "0");
                          endVal = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
                        }
                      }
                      setLiveClassForm({
                        ...liveClassForm,
                        scheduled_start: startVal,
                        scheduled_end: endVal,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold">End Time (Default 1 hour)</Label>
                  <Input 
                    type="datetime-local" 
                    className="bg-slate-950 border-slate-800 text-white h-11 [color-scheme:dark]"
                    value={liveClassForm.scheduled_end}
                    onChange={(e) => setLiveClassForm({...liveClassForm, scheduled_end: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
                <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-white" onClick={() => setShowScheduleForm(false)}>
                  Back to List
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold" 
                  onClick={handleScheduleLive}
                  disabled={scheduling}
                >
                  {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Schedule & Secure Room
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* YouTube Lectures / IFrame Management Dialog */}
      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Manage YouTube Lectures
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Add embedded YouTube lessons for <b>{selectedCourse?.title}</b>.
            </DialogDescription>
          </DialogHeader>

          {/* List of existing videos */}
          <div className="space-y-3 max-h-60 overflow-y-auto py-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            <Label className="text-slate-300 font-bold">Current shared lectures ({resources.length})</Label>
            {loadingResources ? (
              <div className="text-center py-4 text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading shared lectures...
              </div>
            ) : resources.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No videos shared for this course yet.</p>
            ) : (
              <div className="grid gap-2">
                {resources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{res.title}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{res.youtube_url}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                      onClick={() => handleDeleteResource(res.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-800/80" />

          {/* Form to add resource */}
          <div className="space-y-4 py-2">
            <Label className="text-slate-300 font-bold block mb-1">Add New Video Lecture</Label>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 font-bold">Lecture Title</Label>
                <Input 
                  placeholder="e.g. Lecture 1: Pediatric Nursing Fundamentals" 
                  className="bg-slate-950 border-slate-800 text-white h-10"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 font-bold">YouTube Video URL</Label>
                <Input 
                  placeholder="e.g. https://www.youtube.com/watch?v=..." 
                  className="bg-slate-950 border-slate-800 text-white h-10"
                  value={resourceForm.youtube_url}
                  onChange={(e) => setResourceForm({...resourceForm, youtube_url: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 font-bold">Brief Description (Optional)</Label>
                <Textarea 
                  placeholder="Explain what topics are covered in this lecture..." 
                  className="bg-slate-950 border-slate-800 text-white"
                  rows={2}
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-white" onClick={() => setResourceDialogOpen(false)}>
              Close
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-500 text-white font-bold" 
              onClick={handleAddResource}
              disabled={addingResource}
            >
              {addingResource ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Lecture IFrame
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
