"use client";

import { useEffect, useState } from "react";
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
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileCheck2,
  Loader2,
  BookOpen,
  Award,
  AlertCircle,
  Save,
  Upload,
  Image as ImageIcon,
  X,
  Users,
  Search,
  Eye,
  RotateCw,
  XCircle,
  Percent,
  Timer,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Exam, ExamQuestion, ExamSubmission } from "@/lib/types";

export default function StaffExamQuestionsEditor() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab: "questions" | "submissions"
  const [activeTab, setActiveTab] = useState<"questions" | "submissions">("questions");

  // Add Question Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [uploadingAddImage, setUploadingAddImage] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const [qForm, setQForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    marks: "1",
    explanation: "",
    image_url: "",
  });

  // Edit Question Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const [editForm, setEditForm] = useState({
    id: "",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A" as "A" | "B" | "C" | "D",
    marks: "1",
    explanation: "",
    image_url: "",
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [submissionsStats, setSubmissionsStats] = useState<any>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "passed" | "failed">("all");
  const [viewingSubmission, setViewingSubmission] = useState<ExamSubmission | null>(null);

  const fetchExamDetails = async () => {
    try {
      const res = await fetch(`/api/exams/${examId}`, { cache: "no-store" });
      if (!res.ok) {
        toast({
          title: "Exam not found",
          description: "Could not retrieve exam details.",
          variant: "destructive",
        });
        return;
      }
      const data = await res.json();
      setExam(data.exam);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load exam questions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/exams/${examId}/submissions`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        setSubmissionsStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
      fetchSubmissions();
    }
  }, [examId]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (isEdit) setUploadingEditImage(true);
    else setUploadingAddImage(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Upload failed",
          description: data.error || "Could not upload image.",
          variant: "destructive",
        });
      } else {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, image_url: data.url }));
        } else {
          setQForm((prev) => ({ ...prev, image_url: data.url }));
        }
        toast({
          title: "Image uploaded! 🖼️",
          description: "Attached to question successfully.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload error",
        description: err?.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      if (isEdit) setUploadingEditImage(false);
      else setUploadingAddImage(false);
    }
  };

  // Add Question Handler
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !qForm.question_text.trim() ||
      !qForm.option_a.trim() ||
      !qForm.option_b.trim() ||
      !qForm.option_c.trim() ||
      !qForm.option_d.trim()
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in the question text and all 4 choices.",
        variant: "destructive",
      });
      return;
    }

    setAddingQuestion(true);
    try {
      const res = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qForm),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to add question",
          description: data.error || "An error occurred.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Question added ✅",
          description: `Question #${questions.length + 1} added with Option ${qForm.correct_option} marked as correct.`,
          variant: "success",
        });
        setAddOpen(false);
        setQForm({
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "A",
          marks: "1",
          explanation: "",
          image_url: "",
        });
        await fetchExamDetails();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setAddingQuestion(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (q: ExamQuestion) => {
    setEditForm({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: (q.correct_option || "A") as "A" | "B" | "C" | "D",
      marks: String(q.marks || 1),
      explanation: q.explanation || "",
      image_url: q.image_url || "",
    });
    setEditOpen(true);
  };

  // Save Edit Question Handler
  const handleSaveEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editForm.question_text.trim() ||
      !editForm.option_a.trim() ||
      !editForm.option_b.trim() ||
      !editForm.option_c.trim() ||
      !editForm.option_d.trim()
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in the question text and all 4 choices.",
        variant: "destructive",
      });
      return;
    }

    setEditingQuestion(true);
    try {
      const res = await fetch(`/api/exams/${examId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Failed to update question",
          description: data.error || "An error occurred.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Question updated ✅",
          description: "Question details and options saved.",
          variant: "success",
        });
        setEditOpen(false);
        await fetchExamDetails();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setEditingQuestion(false);
    }
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setDeletingQuestionId(questionId);
    try {
      const res = await fetch(`/api/exams/${examId}/questions?id=${questionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Question deleted",
          description: "Question removed from exam.",
          variant: "success",
        });
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } else {
        const data = await res.json();
        toast({
          title: "Deletion failed",
          description: data.error || "Could not delete question.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // Toggle Exam Publish
  const togglePublishStatus = async () => {
    if (!exam) return;
    const newStatus = !exam.is_published;
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newStatus }),
      });
      if (res.ok) {
        setExam({ ...exam, is_published: newStatus });
        toast({
          title: newStatus ? "Exam Published 🚀" : "Exam Unpublished",
          description: newStatus
            ? "Students can now view and take this exam."
            : "Exam is now hidden from student portal.",
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Error updating status",
        variant: "destructive",
      });
    }
  };

  // Format Duration Helper
  const formatDuration = (totalSeconds?: number | null, startedAt?: string, submittedAt?: string) => {
    let sec = totalSeconds;
    if (!sec && startedAt && submittedAt) {
      sec = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000));
    }
    if (!sec || sec <= 0) return "1 min";
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec}s`;
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.student?.full_name?.toLowerCase() || "";
    const studentEmail = sub.student?.email?.toLowerCase() || "";
    const query = submissionSearch.toLowerCase();
    const matchesSearch = studentName.includes(query) || studentEmail.includes(query);

    if (submissionFilter === "passed") return matchesSearch && sub.passed;
    if (submissionFilter === "failed") return matchesSearch && !sub.passed;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 font-semibold text-sm">Loading exam manager...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Exam not found</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/instructor/exams">Back to Exams List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation Back */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-3 gap-1.5 border-slate-200 text-slate-700 font-semibold"
        >
          <Link href="/instructor/exams">
            <ArrowLeft className="h-4 w-4" />
            <span>All Exams</span>
          </Link>
        </Button>
      </div>

      {/* Exam Header Overview Card */}
      <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs">
                  {exam.course?.title || "Course Exam"}
                </Badge>
                <Badge
                  className={
                    exam.is_published
                      ? "bg-emerald-600 text-white font-bold text-[11px]"
                      : "bg-slate-200 text-slate-700 font-bold text-[11px]"
                  }
                >
                  {exam.is_published ? "Published to Students" : "Draft / Hidden"}
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-900">
                {exam.title}
              </CardTitle>
              {exam.description && (
                <CardDescription className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
                  {exam.description}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={exam.is_published ? "outline" : "default"}
                size="sm"
                onClick={togglePublishStatus}
                className="rounded-xl font-bold text-xs h-9"
              >
                {exam.is_published ? "Make Draft" : "Publish to Students"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Questions</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{questions.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Marks</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Allowed</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{exam.duration_minutes} Mins</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Passing Criteria</div>
              <div className="text-base font-black text-emerald-600 mt-0.5">{exam.pass_percentage}% Marks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Section Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "questions"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Questions Bank</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === "questions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {questions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("submissions");
            fetchSubmissions();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "submissions"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Student Results & Submissions</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === "submissions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {submissions.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW TAB 1: QUESTIONS BANK & EDITOR */}
      {/* ============================================================== */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Questions List</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                  {questions.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add, edit, or remove exam questions. Attach diagrams or illustration images as needed.
              </p>
            </div>

            {/* Add Question Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs shadow-md shadow-emerald-600/20">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Question</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
                <form onSubmit={handleAddQuestion}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-emerald-600" />
                      Add Multiple-Choice Question
                    </DialogTitle>
                    <DialogDescription>
                      Enter question text, 4 choices, correct answer, and optional illustration.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Question Statement */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Question Statement *</Label>
                      <Textarea
                        placeholder="e.g. Which hormone is primarily responsible for the stimulation of uterine contractions during labor?"
                        value={qForm.question_text}
                        onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
                        className="rounded-xl font-medium text-xs sm:text-sm"
                        rows={3}
                        required
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Label className="text-xs font-bold flex items-center gap-1.5 text-slate-700">
                        <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Question Diagram / Image (Optional)</span>
                      </Label>

                      {qForm.image_url ? (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qForm.image_url}
                            alt="Question preview"
                            className="max-h-48 w-auto mx-auto rounded-lg object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setQForm({ ...qForm, image_url: "" })}
                            className="absolute top-3 right-3 h-7 px-2 text-xs rounded-lg gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="relative mt-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-100/70 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingAddImage}
                            onChange={(e) => handleImageUpload(e, false)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {uploadingAddImage ? (
                            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading image...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="h-6 w-6 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Click to upload diagram</span>
                              <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 4 Options Grid */}
                    <div className="space-y-3 pt-1">
                      <Label className="text-xs font-bold">Answer Choices *</Label>

                      {/* Option A */}
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                          A
                        </span>
                        <Input
                          placeholder="Choice A text"
                          value={qForm.option_a}
                          onChange={(e) => setQForm({ ...qForm, option_a: e.target.value })}
                          className="rounded-xl text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Option B */}
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                          B
                        </span>
                        <Input
                          placeholder="Choice B text"
                          value={qForm.option_b}
                          onChange={(e) => setQForm({ ...qForm, option_b: e.target.value })}
                          className="rounded-xl text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Option C */}
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                          C
                        </span>
                        <Input
                          placeholder="Choice C text"
                          value={qForm.option_c}
                          onChange={(e) => setQForm({ ...qForm, option_c: e.target.value })}
                          className="rounded-xl text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Option D */}
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                          D
                        </span>
                        <Input
                          placeholder="Choice D text"
                          value={qForm.option_d}
                          onChange={(e) => setQForm({ ...qForm, option_d: e.target.value })}
                          className="rounded-xl text-xs sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Right Answer Selector & Marks */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Select Right Answer *
                        </Label>
                        <Select
                          value={qForm.correct_option}
                          onValueChange={(val) => setQForm({ ...qForm, correct_option: val })}
                        >
                          <SelectTrigger className="rounded-xl font-extrabold text-xs sm:text-sm border-emerald-300 bg-emerald-50/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A" className="font-bold">Option A</SelectItem>
                            <SelectItem value="B" className="font-bold">Option B</SelectItem>
                            <SelectItem value="C" className="font-bold">Option C</SelectItem>
                            <SelectItem value="D" className="font-bold">Option D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Marks</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={qForm.marks}
                          onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                          className="rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Clinical Rationale / Explanation (Optional)</Label>
                      <Textarea
                        placeholder="e.g. Oxytocin is synthesized by the hypothalamus and released by the posterior pituitary..."
                        value={qForm.explanation}
                        onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                        className="rounded-xl text-xs resize-none"
                        rows={2}
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addingQuestion || uploadingAddImage}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                    >
                      {addingQuestion ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Question"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Question Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
              <form onSubmit={handleSaveEditQuestion}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Edit className="h-5 w-5 text-blue-600" />
                    Edit Question
                  </DialogTitle>
                  <DialogDescription>
                    Update question statement, choices, right answer, or diagram.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Question Statement */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Question Statement *</Label>
                    <Textarea
                      value={editForm.question_text}
                      onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                      className="rounded-xl font-medium text-xs sm:text-sm"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <Label className="text-xs font-bold flex items-center gap-1.5 text-slate-700">
                      <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>Question Diagram / Image (Optional)</span>
                    </Label>

                    {editForm.image_url ? (
                      <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editForm.image_url}
                          alt="Question preview"
                          className="max-h-48 w-auto mx-auto rounded-lg object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setEditForm({ ...editForm, image_url: "" })}
                          className="absolute top-3 right-3 h-7 px-2 text-xs rounded-lg gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="relative mt-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-100/70 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingEditImage}
                          onChange={(e) => handleImageUpload(e, true)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {uploadingEditImage ? (
                          <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading image...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-6 w-6 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">Click to upload diagram</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4 Options Grid */}
                  <div className="space-y-3 pt-1">
                    <Label className="text-xs font-bold">Answer Choices *</Label>

                    {/* Option A */}
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                        A
                      </span>
                      <Input
                        value={editForm.option_a}
                        onChange={(e) => setEditForm({ ...editForm, option_a: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                        required
                      />
                    </div>

                    {/* Option B */}
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                        B
                      </span>
                      <Input
                        value={editForm.option_b}
                        onChange={(e) => setEditForm({ ...editForm, option_b: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                        required
                      />
                    </div>

                    {/* Option C */}
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                        C
                      </span>
                      <Input
                        value={editForm.option_c}
                        onChange={(e) => setEditForm({ ...editForm, option_c: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                        required
                      />
                    </div>

                    {/* Option D */}
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs shrink-0">
                        D
                      </span>
                      <Input
                        value={editForm.option_d}
                        onChange={(e) => setEditForm({ ...editForm, option_d: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Answer Selector & Marks */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Select Right Answer *
                      </Label>
                      <Select
                        value={editForm.correct_option}
                        onValueChange={(val: "A" | "B" | "C" | "D") =>
                          setEditForm({ ...editForm, correct_option: val })
                        }
                      >
                        <SelectTrigger className="rounded-xl font-extrabold text-xs sm:text-sm border-emerald-300 bg-emerald-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A" className="font-bold">Option A</SelectItem>
                          <SelectItem value="B" className="font-bold">Option B</SelectItem>
                          <SelectItem value="C" className="font-bold">Option C</SelectItem>
                          <SelectItem value="D" className="font-bold">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Marks</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={editForm.marks}
                        onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Clinical Rationale / Explanation (Optional)</Label>
                    <Textarea
                      value={editForm.explanation}
                      onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                      className="rounded-xl text-xs resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editingQuestion || uploadingEditImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                  >
                    {editingQuestion ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Questions Cards List */}
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 py-16 text-center">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Questions Added Yet</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Click &quot;Add Question&quot; to insert multiple-choice questions and mark the correct answer.
                </p>
                <Button
                  onClick={() => setAddOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card
                  key={q.id}
                  className="border-slate-200/90 rounded-2xl shadow-xs overflow-hidden bg-white"
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-6 px-2 rounded-md bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          Q{idx + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-500">
                          {q.marks || 1} {Number(q.marks) === 1 ? "Mark" : "Marks"}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm sm:text-base font-bold text-slate-900 pt-1 leading-relaxed">
                        {q.question_text}
                      </CardTitle>

                      {/* Display Question Image if present */}
                      {q.image_url && (
                        <div className="pt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={q.image_url}
                            alt="Question diagram"
                            onClick={() => window.open(q.image_url!, "_blank")}
                            title="Click to view full resolution"
                            className="max-h-56 max-w-xs sm:max-w-sm rounded-xl border border-slate-200 object-contain bg-slate-50 p-1 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(q)}
                        className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200 rounded-lg gap-1 text-xs font-semibold"
                        title="Edit question"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={deletingQuestionId === q.id}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-lg"
                        title="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                    {/* 4 Choices Rendered with Right Answer Highlighted for Staff */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Option A */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          q.correct_option === "A"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                            : "bg-slate-50/70 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                            q.correct_option === "A"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          A
                        </span>
                        <span className="flex-1">{q.option_a}</span>
                        {q.correct_option === "A" && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 h-4">
                            Right Answer
                          </Badge>
                        )}
                      </div>

                      {/* Option B */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          q.correct_option === "B"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                            : "bg-slate-50/70 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                            q.correct_option === "B"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          B
                        </span>
                        <span className="flex-1">{q.option_b}</span>
                        {q.correct_option === "B" && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 h-4">
                            Right Answer
                          </Badge>
                        )}
                      </div>

                      {/* Option C */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          q.correct_option === "C"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                            : "bg-slate-50/70 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                            q.correct_option === "C"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          C
                        </span>
                        <span className="flex-1">{q.option_c}</span>
                        {q.correct_option === "C" && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 h-4">
                            Right Answer
                          </Badge>
                        )}
                      </div>

                      {/* Option D */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          q.correct_option === "D"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                            : "bg-slate-50/70 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                            q.correct_option === "D"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          D
                        </span>
                        <span className="flex-1">{q.option_d}</span>
                        {q.correct_option === "D" && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 h-4">
                            Right Answer
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Explanation if present */}
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="font-bold text-slate-800 shrink-0">Rationale:</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW TAB 2: STUDENT RESULTS & SUBMISSIONS */}
      {/* ============================================================== */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-slate-200/90 rounded-2xl bg-white shadow-xs p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Attempts</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {submissionsStats?.total_submissions || submissions.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Students submitted</div>
            </Card>

            <Card className="border-slate-200/90 rounded-2xl bg-white shadow-xs p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pass Rate</span>
                <Percent className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {submissionsStats?.pass_rate || 0}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {submissionsStats?.passed_count || 0} passed
              </div>
            </Card>

            <Card className="border-slate-200/90 rounded-2xl bg-white shadow-xs p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Score</span>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {submissionsStats?.avg_score || 0}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {exam.total_marks || "Marks"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Class average</div>
            </Card>

            <Card className="border-slate-200/90 rounded-2xl bg-white shadow-xs p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Time Taken</span>
                <Timer className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatDuration(submissionsStats?.avg_time_taken_seconds)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Limit: {exam.duration_minutes}m</div>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="border-slate-200/90 rounded-2xl bg-white shadow-xs">
            <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search student by name or email..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select
                  value={submissionFilter}
                  onValueChange={(val: "all" | "passed" | "failed") => setSubmissionFilter(val)}
                >
                  <SelectTrigger className="w-full sm:w-44 rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="All Results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    <SelectItem value="passed">Passed Only</SelectItem>
                    <SelectItem value="failed">Failed Only</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSubmissions}
                  disabled={loadingSubmissions}
                  className="h-9 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
                  title="Refresh results"
                >
                  <RotateCw className={`h-4 w-4 text-slate-500 ${loadingSubmissions ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List Table / Cards */}
          {loadingSubmissions ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">Loading student submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 py-16 text-center">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Submissions Found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  {submissionSearch || submissionFilter !== "all"
                    ? "No student results match your current filter."
                    : "No students have taken this exam yet. Submissions will show up here automatically."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const studentName = sub.student?.full_name || "Enrolled Student";
                const studentEmail = sub.student?.email || "No email";
                const timeTakenStr = formatDuration(
                  sub.time_taken_seconds,
                  sub.started_at,
                  sub.submitted_at
                );

                const submittedDateStr = new Date(sub.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Card
                    key={sub.id}
                    className="border-slate-200/90 rounded-2xl shadow-xs overflow-hidden bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm shrink-0">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {studentName}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{studentEmail}</p>
                        </div>
                      </div>

                      {/* Performance Metas */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs w-full sm:w-auto justify-between sm:justify-end">
                        {/* Time Taken */}
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold">{timeTakenStr}</span>
                        </div>

                        {/* Score & Percentage */}
                        <div className="text-right">
                          <div className="font-black text-slate-900 text-sm">
                            {sub.score}{" "}
                            <span className="text-slate-400 text-xs font-normal">
                              / {sub.total_marks}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {sub.percentage}% Score
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={
                            sub.passed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[11px]"
                              : "bg-rose-50 text-rose-800 border-rose-200 font-bold text-[11px]"
                          }
                        >
                          {sub.passed ? "Passed ✓" : "Failed ✗"}
                        </Badge>

                        {/* Date */}
                        <div className="text-slate-400 text-[11px] hidden md:block">
                          {submittedDateStr}
                        </div>

                        {/* Action: View Answers */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingSubmission(sub)}
                          className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>Review</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Student Detailed Answers Review Modal */}
          <Dialog open={Boolean(viewingSubmission)} onOpenChange={(open) => !open && setViewingSubmission(null)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
              {viewingSubmission && (
                <div>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          viewingSubmission.passed
                            ? "bg-emerald-600 text-white font-bold text-[11px]"
                            : "bg-rose-600 text-white font-bold text-[11px]"
                        }
                      >
                        {viewingSubmission.passed ? "Passed" : "Failed"}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium">
                        Time: {formatDuration(viewingSubmission.time_taken_seconds, viewingSubmission.started_at, viewingSubmission.submitted_at)}
                      </span>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {viewingSubmission.student?.full_name || "Student"} - Exam Submission
                    </DialogTitle>
                    <DialogDescription>
                      Scored {viewingSubmission.score} of {viewingSubmission.total_marks} marks ({viewingSubmission.percentage}%)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {questions.map((q, idx) => {
                      const studentAns = viewingSubmission.answers?.[q.id];
                      const isCorrect = studentAns === q.correct_option;
                      const isUnanswered = !studentAns;

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              Q{idx + 1}. {q.question_text}
                            </span>
                            <Badge
                              className={`text-[10px] shrink-0 ${
                                isUnanswered
                                  ? "bg-slate-100 text-slate-600"
                                  : isCorrect
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "bg-rose-100 text-rose-800 font-bold"
                              }`}
                            >
                              {isUnanswered
                                ? "Skipped"
                                : isCorrect
                                ? `+${q.marks} Correct`
                                : "0 Marks"}
                            </Badge>
                          </div>

                          {q.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={q.image_url}
                              alt="Question"
                              className="max-h-36 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100"
                            />
                          )}

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {(["A", "B", "C", "D"] as const).map((optKey) => {
                              const optText =
                                optKey === "A"
                                  ? q.option_a
                                  : optKey === "B"
                                  ? q.option_b
                                  : optKey === "C"
                                  ? q.option_c
                                  : q.option_d;

                              const isSelected = studentAns === optKey;
                              const isRight = q.correct_option === optKey;

                              let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                              if (isRight) {
                                bgClass = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                              } else if (isSelected && !isRight) {
                                bgClass = "bg-rose-50 border-rose-300 text-rose-950 font-bold";
                              }

                              return (
                                <div
                                  key={optKey}
                                  className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${bgClass}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold">{optKey}.</span>
                                    <span>{optText}</span>
                                  </div>
                                  <div>
                                    {isSelected && isRight && (
                                      <span className="text-emerald-700 font-bold text-[10px]">
                                        Student (Right) ✓
                                      </span>
                                    )}
                                    {isSelected && !isRight && (
                                      <span className="text-rose-700 font-bold text-[10px]">
                                        Student (Wrong) ✗
                                      </span>
                                    )}
                                    {!isSelected && isRight && (
                                      <span className="text-emerald-700 font-bold text-[10px]">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600">
                              <span className="font-bold text-slate-700">Rationale: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setViewingSubmission(null)}
                      className="rounded-xl font-semibold text-xs"
                    >
                      Close Review
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
