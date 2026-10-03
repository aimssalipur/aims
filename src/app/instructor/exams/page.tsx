"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Clock,
  Award,
  BookOpen,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  FileCheck2,
  Loader2,
  RotateCw,
  HelpCircle,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Exam, Course } from "@/lib/types";

export default function StaffExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Create Dialog State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    duration_minutes: "30",
    pass_percentage: "50",
    is_published: true,
  });

  const fetchData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([
        fetch("/api/exams", { cache: "no-store" }),
        fetch("/api/courses", { cache: "no-store" }),
      ]);

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        if (Array.isArray(examsData)) setExams(examsData);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        if (coursesData.courses && Array.isArray(coursesData.courses)) {
          setCourses(coursesData.courses);
        }
      }
    } catch (err) {
      console.error("Failed to load exams data:", err);
      toast({
        title: "Error loading exams",
        description: "Could not fetch exam list from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast({
      title: "Updated",
      description: "Exams ledger refreshed.",
      variant: "success",
    });
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title.trim()) {
      toast({
        title: "Missing fields",
        description: "Please select a course and provide an exam title.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to create exam",
          description: data.error || "An error occurred.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Exam Created! 🎉",
          description: "Now you can add questions and options.",
          variant: "success",
        });
        setCreateOpen(false);
        setForm({
          course_id: "",
          title: "",
          description: "",
          duration_minutes: "30",
          pass_percentage: "50",
          is_published: true,
        });
        await fetchData();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam and all its questions?")) return;

    setDeletingId(examId);
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Exam deleted",
          description: "Exam has been removed.",
          variant: "success",
        });
        setExams((prev) => prev.filter((x) => x.id !== examId));
      } else {
        const data = await res.json();
        toast({
          title: "Deletion failed",
          description: data.error || "Unable to delete exam.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete exam.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesCourse = courseFilter === "all" || exam.course_id === courseFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      exam.title.toLowerCase().includes(term) ||
      (exam.course?.title || "").toLowerCase().includes(term);
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Staff Assessment Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Online MCQ Exams 📝
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Create online multiple-choice tests per course, set right answers, and evaluate student performances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
          >
            <RotateCw className={`h-4 w-4 text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20">
                <PlusCircle className="h-4 w-4" />
                <span>Create Exam</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <form onSubmit={handleCreateExam}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-emerald-600" />
                    New Course MCQ Exam
                  </DialogTitle>
                  <DialogDescription>
                    Configure exam rules. You can add questions right after saving.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Select Course */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Target Course *</Label>
                    <Select
                      value={form.course_id}
                      onValueChange={(val) => setForm({ ...form, course_id: val })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Choose course..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Exam Title *</Label>
                    <Input
                      placeholder="e.g. Unit 1: Anatomy & Physiology Mock Test"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Instructions / Syllabus (Optional)</Label>
                    <Textarea
                      placeholder="e.g. 30 questions covering fundamental cardiac systems. Negative marking does not apply."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="rounded-xl text-xs resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Duration & Passing Score */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Duration (Minutes)</Label>
                      <Input
                        type="number"
                        min={5}
                        max={300}
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Pass Percentage (%)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={form.pass_percentage}
                        onChange={(e) => setForm({ ...form, pass_percentage: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                  >
                    {creating ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create & Add Questions"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search exam title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-64 rounded-xl text-xs sm:text-sm font-semibold">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Loading course exams...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 py-16 text-center">
          <CardContent className="space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <FileCheck2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Exams Found</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              {searchTerm || courseFilter !== "all"
                ? "No exams match your search filters."
                : "No exams have been published yet. Click 'Create Exam' to set up your first online test."}
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2 text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              Create Exam Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="border-slate-200/90 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="font-bold text-[10px] bg-slate-50 text-emerald-800 border-emerald-200 max-w-[200px] truncate"
                  >
                    {exam.course?.title || "Course Exam"}
                  </Badge>
                  <Badge
                    className={
                      exam.is_published
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"
                        : "bg-slate-100 text-slate-600 text-[10px]"
                    }
                  >
                    {exam.is_published ? "Active" : "Draft"}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2">
                  {exam.title}
                </CardTitle>
                {exam.description && (
                  <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {exam.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Questions</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {exam.questions_count || 0}
                    </div>
                  </div>
                  <div className="border-x border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Time</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {exam.duration_minutes}m
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Pass %</div>
                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                      {exam.pass_percentage}%
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteExam(exam.id)}
                  disabled={deletingId === exam.id}
                  className="h-9 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                  title="Delete Exam"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 flex-1"
                >
                  <Link href={`/instructor/exams/${exam.id}`}>
                    <Edit className="h-3.5 w-3.5" />
                    <span>Manage Questions</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
