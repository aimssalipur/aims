"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Award,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Exam, ExamQuestion } from "@/lib/types";

export default function StudentExamRoom() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam taking state: "briefing" | "taking" | "submitting" | "result"
  const [examState, setExamState] = useState<"briefing" | "taking" | "submitting" | "result">("briefing");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 min default
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`/api/exams/${examId}`, { cache: "no-store" });
        if (!res.ok) {
          toast({
            title: "Exam unavailable",
            description: "Could not load test questions.",
            variant: "destructive",
          });
          return;
        }

        const data = await res.json();
        setExam(data.exam);
        setQuestions(data.questions || []);
        if (data.exam?.duration_minutes) {
          setSecondsRemaining(data.exam.duration_minutes * 60);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (examId) loadExam();
  }, [examId]);

  // Start Exam
  const handleStartExam = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions configured",
        description: "This exam does not have any questions yet. Please check back later.",
        variant: "destructive",
      });
      return;
    }
    setExamState("taking");
  };

  // Timer countdown
  useEffect(() => {
    if (examState !== "taking") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  const handleSelectOption = (questionId: string, option: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleAutoSubmit = async () => {
    toast({
      title: "Time is up! ⏰",
      description: "Auto-submitting your exam answers...",
    });
    await submitTest();
  };

  const submitTest = async () => {
    setConfirmSubmitOpen(false);
    setExamState("submitting");

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Submission failed",
          description: data.error || "Failed to calculate result.",
          variant: "destructive",
        });
        setExamState("taking");
      } else {
        setExamResult(data);
        setExamState("result");
        toast({
          title: data.passed ? "Congratulations! 🎉" : "Exam Complete",
          description: `You scored ${data.score} out of ${data.total_marks} marks (${data.percentage}%).`,
          variant: data.passed ? "success" : "default",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error submitting exam",
        description: err?.message || "Please check your internet connection.",
        variant: "destructive",
      });
      setExamState("taking");
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentIdx];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 font-semibold text-sm">Preparing exam room...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Exam not found</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/student/exams">Back to Exams List</Link>
        </Button>
      </div>
    );
  }

  // ==========================================
  // 1. BRIEFING / INSTRUCTIONS SCREEN
  // ==========================================
  if (examState === "briefing") {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
        <Button asChild variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
          <Link href="/student/exams">
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Link>
        </Button>

        <Card className="border-slate-200/90 rounded-3xl shadow-lg bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 sm:p-8 text-white">
            <Badge className="bg-white/20 text-white border-0 font-bold mb-3 text-xs">
              {exam.course?.title || "AIMS Assessment"}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
                {exam.description}
              </p>
            )}
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Questions</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{questions.length}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{exam.duration_minutes} Mins</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Passing Score</div>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{exam.pass_percentage}%</div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed">
              <div className="font-extrabold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="h-4 w-4 text-blue-700" />
                Exam Rules & Instructions
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-700 text-xs">
                <li>Once you start, the countdown timer cannot be paused.</li>
                <li>You can jump to any question using the question navigator.</li>
                <li>Your answers will be saved as you click choices.</li>
                <li>When the timer expires, the test will automatically submit.</li>
                <li>Your score and percentage will be calculated instantly upon submission.</li>
              </ul>
            </div>

            <Button
              onClick={handleStartExam}
              disabled={questions.length === 0}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25"
            >
              Start Online Exam Now 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // 2. ACTIVE TEST SCREEN
  // ==========================================
  if (examState === "taking" || examState === "submitting") {
    const isUrgent = secondsRemaining < 120; // less than 2 mins

    return (
      <div className="max-w-5xl mx-auto space-y-5 pb-16">
        {/* Sticky Header with Timer & Progress */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
              {exam.title}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800">
              Question {currentIdx + 1} of {questions.length} ·{" "}
              <span className="text-blue-600 font-extrabold">{answeredCount} answered</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-extrabold text-xs sm:text-sm border ${
                isUrgent
                  ? "bg-rose-100 text-rose-700 border-rose-300 animate-pulse"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <Button
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={examState === "submitting"}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-9 px-3 sm:px-4 shadow-sm"
            >
              {examState === "submitting" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Finish Test
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Test Area with Question & Question Palette Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Question Card */}
          <div className="lg:col-span-3 space-y-4">
            {currentQ && (
              <Card className="border-slate-200/90 rounded-2xl shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-black text-xs">
                      Question {currentIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {currentQ.marks || 1} {Number(currentQ.marks) === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ.question_text}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-3">
                  {/* Options (A, B, C, D) - Large Interactive Radio Cards */}
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const optText =
                      optKey === "A"
                        ? currentQ.option_a
                        : optKey === "B"
                        ? currentQ.option_b
                        : optKey === "C"
                        ? currentQ.option_c
                        : currentQ.option_d;

                    const isSelected = answers[currentQ.id] === optKey;

                    return (
                      <button
                        type="button"
                        key={optKey}
                        onClick={() => handleSelectOption(currentQ.id, optKey)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 text-blue-950 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        <div
                          className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {optKey}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm flex-1 leading-snug">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>

                <CardFooter className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="rounded-xl h-10 px-4 font-bold text-xs"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Previous
                  </Button>

                  {currentIdx < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="rounded-xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Next Question
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setConfirmSubmitOpen(true)}
                      className="rounded-xl h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Review & Submit
                      <Send className="h-4 w-4 ml-1.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right Question Palette */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200/90 rounded-2xl shadow-xs bg-white p-4">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Question Palette
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? "ring-2 ring-blue-600 ring-offset-2"
                          : ""
                      } ${
                        isAnswered
                          ? "bg-emerald-600 text-white font-black"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md bg-emerald-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md bg-slate-200" />
                  <span>Unanswered ({questions.length - answeredCount})</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Submit Online Exam?
              </DialogTitle>
              <DialogDescription>
                You have answered <span className="font-bold text-slate-900">{answeredCount}</span> out of{" "}
                <span className="font-bold text-slate-900">{questions.length}</span> questions.
              </DialogDescription>
            </DialogHeader>

            {answeredCount < questions.length && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  You still have {questions.length - answeredCount} unanswered questions.
                </span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmSubmitOpen(false)}
                className="rounded-xl font-semibold"
              >
                Continue Test
              </Button>
              <Button
                onClick={submitTest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Yes, Submit Exam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ==========================================
  // 3. POST-EXAM RESULT SCREEN
  // ==========================================
  if (examState === "result" && examResult) {
    const passed = examResult.passed;

    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6">
        <Card className="border-slate-200/90 rounded-3xl shadow-xl bg-white overflow-hidden text-center">
          {/* Header Banner */}
          <div
            className={`p-8 text-white ${
              passed
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700"
                : "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800"
            }`}
          >
            <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
              {passed ? (
                <Award className="h-9 w-9 text-amber-300" />
              ) : (
                <RotateCcw className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {passed ? "Congratulations! You Passed! 🎉" : "Exam Completed"}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
              {passed
                ? `You successfully cleared the ${exam.title} assessment!`
                : "Good effort! Review key medical concepts and try again to improve your score."}
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Score Highlight */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Final Score
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-1">
                {examResult.score}{" "}
                <span className="text-lg sm:text-2xl text-slate-400 font-bold">
                  / {examResult.total_marks}
                </span>
              </div>
              <div
                className={`text-sm font-extrabold mt-2 ${
                  passed ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                Accuracy: {examResult.percentage}% · Passing Mark: {exam.pass_percentage}%
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Correct</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {examResult.correct_count}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                <div className="text-[10px] font-bold text-rose-800 uppercase">Incorrect</div>
                <div className="text-lg font-black text-rose-700 mt-0.5">
                  {examResult.wrong_count}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Skipped</div>
                <div className="text-lg font-black text-slate-700 mt-0.5">
                  {examResult.unanswered_count}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-1/2 h-11 rounded-xl font-bold text-xs"
              >
                <Link href="/student/exams">Back to Exams List</Link>
              </Button>
              <Button
                onClick={() => {
                  setAnswers({});
                  setCurrentIdx(0);
                  setExamState("taking");
                  setSecondsRemaining(exam.duration_minutes * 60);
                }}
                className="w-full sm:w-1/2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Retake Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
