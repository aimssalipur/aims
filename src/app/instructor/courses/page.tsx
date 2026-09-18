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
  Loader2,
  RefreshCw,
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
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [creatingCourse, setCreatingCourse] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit Course Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditCourse, setSelectedEditCourse] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Fetch all courses from the database
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
          return;
        }
      }
      // If database has no courses or on unexpected format, fallback to default seed
      setCourses(dummyCourses);
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses(dummyCourses);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) {
      setUploadingEditImage(true);
    } else {
      setUploadingImage(true);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      if (data?.url) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, thumbnail_url: data.url }));
        } else {
          setCourseForm((prev) => ({ ...prev, thumbnail_url: data.url }));
        }
        toast({
          title: "Thumbnail Uploaded! 📸",
          description: "Image successfully uploaded and ready.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Note",
        description: err.message || "Could not upload image. You can also paste a direct image URL.",
        variant: "destructive",
      });
    } finally {
      if (isEdit) {
        setUploadingEditImage(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  // Create Course handler (POST to /api/courses)
  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a course title.",
        variant: "destructive",
      });
      return;
    }
    if (!courseForm.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a course description.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCourse(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create course");
      }

      toast({
        title: "Course Created! 🎉",
        description: `"${data.course?.title || courseForm.title}" has been added successfully.`,
        variant: "success",
      });

      setDialogOpen(false);
      setCourseForm({ title: "", description: "", thumbnail_url: "" });
      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingCourse(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEditDialog = (course: any) => {
    setSelectedEditCourse(course);
    setEditForm({
      title: course.title || "",
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
    });
    setEditDialogOpen(true);
  };

  // Save Edit Course handler (PATCH to /api/courses/[courseId])
  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Course title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/courses/${selectedEditCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update course");
      }

      toast({
        title: "Course Updated! ✏️",
        description: "Course details have been updated successfully.",
        variant: "success",
      });

      setEditDialogOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update course.",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Course handler (DELETE to /api/courses/[courseId])
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This will permanently delete the course and its linked materials.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to delete course");
      }

      toast({
        title: "Course Deleted",
        description: `"${courseTitle}" was removed successfully.`,
        variant: "success",
      });

      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete course.",
        variant: "destructive",
      });
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

  // All active AIMS nursing courses mapping
  const enrollmentMap: Record<
    string,
    {
      enrolled: number;
      avgProgress: number;
      lectures: number;
      badge: string;
      badgeVariant: "default" | "secondary" | "warning" | "gold";
    }
  > = {
    "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1": { enrolled: 68, avgProgress: 64, lectures: 54, badge: "Active", badgeVariant: "default" },
    "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2": { enrolled: 62, avgProgress: 70, lectures: 60, badge: "Active", badgeVariant: "gold" },
    "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3": { enrolled: 48, avgProgress: 58, lectures: 48, badge: "Active", badgeVariant: "default" },
    "c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4": { enrolled: 38, avgProgress: 65, lectures: 42, badge: "Active", badgeVariant: "warning" },
    "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5": { enrolled: 44, avgProgress: 62, lectures: 46, badge: "Active", badgeVariant: "secondary" },
    "c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6": { enrolled: 54, avgProgress: 72, lectures: 44, badge: "Active", badgeVariant: "warning" },
    "c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7": { enrolled: 32, avgProgress: 50, lectures: 48, badge: "Active", badgeVariant: "secondary" },
    "c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9": { enrolled: 42, avgProgress: 55, lectures: 45, badge: "Active", badgeVariant: "gold" },
    "ca10ca10-ca10-ca10-ca10-ca10ca10ca10": { enrolled: 50, avgProgress: 63, lectures: 56, badge: "Active", badgeVariant: "default" },
    "cb11cb11-cb11-cb11-cb11-cb11cb11cb11": { enrolled: 45, avgProgress: 60, lectures: 50, badge: "Active", badgeVariant: "gold" },
    "cc12cc12-cc12-cc12-cc12-cc12cc12cc12": { enrolled: 46, avgProgress: 61, lectures: 52, badge: "Active", badgeVariant: "default" },
    "cd13cd13-cd13-cd13-cd13-cd13cd13cd13": { enrolled: 76, avgProgress: 74, lectures: 48, badge: "Active", badgeVariant: "gold" },
  };

  const myCourses = (courses.length > 0 ? courses : dummyCourses).map((c, i) => {
    const meta = enrollmentMap[c.id] || {
      enrolled: 40 + ((i + 1) * 7) % 35,
      avgProgress: 55 + ((i + 1) * 5) % 30,
      lectures: 48,
      badge: "Active",
      badgeVariant: "default" as const,
    };
    return {
      ...c,
      enrolled: meta.enrolled,
      avgProgress: meta.avgProgress,
      lectures: meta.lectures,
      badge: meta.badge,
      badgeVariant: meta.badgeVariant,
    };
  });

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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage My Courses 📝
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base">
            {myCourses.length} active courses · {myCourses.reduce((a, b) => a + (b.enrolled || 0), 0)} total students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCourses}
            disabled={loadingCourses}
            className="h-9 sm:h-11 text-xs sm:text-sm px-3 sm:px-4 border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loadingCourses ? "animate-spin text-aims-green" : "text-slate-600"}`} />
            Refresh
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 bg-aims-green hover:bg-aims-green/90 shadow-lg shadow-aims-green/20">
                <Plus className="h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold">Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the course details and upload a cover photo. You can edit this anytime.
                </DialogDescription>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 py-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Course Title <span className="text-rose-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Advanced Pediatric Care" 
                    className="h-11" 
                    value={courseForm.title}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description <span className="text-rose-500">*</span></Label>
                  <Textarea 
                    rows={3} 
                    placeholder="Brief summary of the syllabus, target exams, and scope..." 
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
                        {uploadingImage ? "Uploading thumbnail to storage..." : courseForm.thumbnail_url ? "Replace Thumbnail Photo" : "Click to select photo"}
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB · 16:9 ratio</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="pt-1">
                    <Label className="text-[11px] text-slate-500 font-medium">Or paste image web link directly:</Label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      className="h-9 text-xs mt-1" 
                      value={courseForm.thumbnail_url}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
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
                  disabled={creatingCourse || uploadingImage || !courseForm.title.trim() || !courseForm.description.trim()}
                  onClick={handleCreateCourse}
                  className="bg-aims-green hover:bg-aims-green/90 text-white font-bold"
                >
                  {creatingCourse ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Course...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Course Details Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-aims-navy" />
              Edit Course Details
            </DialogTitle>
            <DialogDescription>
              Update information and cover picture for <b>{selectedEditCourse?.title}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 py-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Course Title <span className="text-rose-500">*</span></Label>
              <Input 
                className="h-11" 
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description <span className="text-rose-500">*</span></Label>
              <Textarea 
                rows={3} 
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Thumbnail Image</Label>
              <div className="relative flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-aims-navy/30 bg-slate-50/50 cursor-pointer">
                {editForm.thumbnail_url ? (
                  <div className="relative h-14 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white">
                    <Image
                      src={editForm.thumbnail_url}
                      alt="Course Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                    {uploadingEditImage ? (
                      <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900 mb-1">
                    {uploadingEditImage ? "Uploading thumbnail..." : "Upload New Thumbnail"}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB · 16:9 ratio</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={uploadingEditImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="pt-1">
                <Label className="text-[11px] text-slate-500 font-medium">Or paste image web link directly:</Label>
                <Input 
                  className="h-9 text-xs mt-1" 
                  value={editForm.thumbnail_url}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={savingEdit || uploadingEditImage || !editForm.title.trim()}
              onClick={handleSaveEdit}
              className="bg-aims-navy hover:bg-aims-navy/90 text-white font-bold"
            >
              {savingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loadingCourses && courses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse space-y-4">
              <div className="aspect-[16/10] bg-slate-100 rounded-xl" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6">
          {myCourses.map((course, idx) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              <div className="relative overflow-hidden aspect-[16/10]">
                <Image
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop"}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
                  <Badge
                    variant={(course as any).badgeVariant || "default"}
                    className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 shadow-sm border-0"
                  >
                    {(course as any).badge || "Active"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
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
                      <DropdownMenuItem className="gap-2" onClick={() => handleOpenEditDialog(course)}>
                        <FileEdit className="h-4 w-4 text-blue-600" /> Edit Course Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteCourse(course.id, course.title)}>
                        <Trash2 className="h-4 w-4" /> Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold drop-shadow-md">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.enrolled} Enrolled
                  </span>
                </div>
                <div className="text-base sm:text-lg font-extrabold drop-shadow-md">
                  {course.avgProgress}% avg
                </div>
              </div>
            </div>
            <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg font-extrabold leading-tight line-clamp-2 group-hover:text-aims-green transition-colors">
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 pt-0 space-y-3 sm:space-y-4 flex-1">
              <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 min-h-0 sm:min-h-[2.5rem]">
                {course.description}
              </CardDescription>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Student Completion Rate
                  </span>
                  <span className="text-emerald-600 font-extrabold">{course.avgProgress}%</span>
                </div>
                <Progress value={course.avgProgress} className="h-1.5 sm:h-2" />
              </div>
            </CardContent>
            <CardFooter className="p-3.5 sm:p-5 pt-0 mt-auto flex gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleOpenLiveDialog(course)}
                className="flex-1 gap-1.5 sm:gap-2 h-9 sm:h-10 border-slate-200 hover:bg-slate-50 font-bold text-[11px] sm:text-xs"
              >
                <Video className="h-3.5 w-3.5 text-emerald-600" />
                Live Session
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleOpenResourceDialog(course)}
                className="flex-1 gap-1.5 sm:gap-2 h-9 sm:h-10 border-slate-200 hover:bg-slate-50 font-bold text-[11px] sm:text-xs"
              >
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                Upload IFrame
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}

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
