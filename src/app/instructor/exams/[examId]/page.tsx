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
  CheckCircle2,
  Clock,
  HelpCircle,
  FileCheck2,
  Loader2,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Exam, ExamQuestion } from "@/lib/types";

export default function StaffExamQuestionsEditor() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Question Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
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
  });

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

  useEffect(() => {
    if (examId) fetchExamDetails();
  }, [examId]);

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
        description: "Please fill in the question text and all 4 options.",
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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 font-semibold text-sm">Loading exam questions...</p>
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

      {/* Questions Section Header */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Questions List</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
              {questions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Staff sets the correct answers below. Students will only see the questions and options.
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
                  Enter the question, 4 choices, and designate which option is correct.
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
                  disabled={addingQuestion}
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
                <div className="space-y-1">
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
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteQuestion(q.id)}
                  disabled={deletingQuestionId === q.id}
                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-lg shrink-0"
                  title="Delete question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
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
  );
}
