"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Lightbulb,
  Check,
  Target,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Exam, ExamQuestion, QuestionReviewItem } from "@/lib/types";

export default function StudentExamRoom() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [priorSubmission, setPriorSubmission] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Review screen filter: "all" | "wrong" | "correct" | "unanswered"
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "correct" | "unanswered">("all");
  const [reviewSearch, setReviewSearch] = useState("");

  // Question Image Zoom State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomedTitle, setZoomedTitle] = useState<string>("Question Diagram");
  const [zoomScale, setZoomScale] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoadReview = async () => {
    setLoadingReview(true);
    try {
      const res = await fetch(`/api/exams/${examId}/review`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Could not load review",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      setExamResult({
        ...data.submission,
        review: data.review,
      });
      setExamState("result");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error loading review",
        description: err?.message || "Please check your network connection.",
        variant: "destructive",
      });
    } finally {
      setLoadingReview(false);
    }
  };

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

        if (data.student_submission) {
          setPriorSubmission(data.student_submission);
          // If review requested in URL (?review=true), load review right away
          if (searchParams.get("review") === "true") {
            const revRes = await fetch(`/api/exams/${examId}/review`, { cache: "no-store" });
            if (revRes.ok) {
              const revData = await revRes.json();
              if (revData.review) {
                setExamResult({
                  ...revData.submission,
                  review: revData.review,
                });
                setExamState("result");
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (examId) loadExam();
  }, [examId, searchParams]);

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
    setStartedAt(new Date().toISOString());
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
        body: JSON.stringify({ answers, started_at: startedAt }),
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
        setPriorSubmission(data);
        setExamState("result");
        toast({
          title: data.passed ? "Congratulations! 🎉" : "Exam Complete",
          description: `You scored ${data.score} out of ${data.total_marks} marks (${data.percentage}%). Review your mistakes below to learn!`,
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

  const renderZoomDialog = () => (
    <Dialog open={Boolean(zoomedImage)} onOpenChange={(open) => !open && setZoomedImage(null)}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[92vh] p-4 sm:p-6 rounded-3xl flex flex-col overflow-hidden bg-white">
        <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-blue-600" />
              <span>{zoomedTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Use the zoom controls or scroll to inspect full diagram details.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoomScale((prev) => Math.max(0.75, prev - 0.5))}
              disabled={zoomScale <= 0.75}
              className="h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-xs font-mono font-bold px-2 text-slate-700 min-w-[3.5rem] text-center">
              {Math.round(zoomScale * 100)}%
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoomScale((prev) => Math.min(3.5, prev + 0.5))}
              disabled={zoomScale >= 3.5}
              className="h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoomScale(1)}
              className="h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-700 ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-2xl bg-slate-950/5 p-4 sm:p-8 flex items-center justify-center min-h-[350px] max-h-[65vh]">
          {zoomedImage && (
            <div
              className="transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomScale})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedImage}
                alt="Zoomed diagram"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Tip: Click + to zoom in up to 350%, or Reset to return to normal view.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setZoomedImage(null)}
            className="rounded-xl font-bold text-xs"
          >
            Close Viewer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );


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

        {/* If student previously completed this exam */}
        {priorSubmission && (
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`border-0 text-white text-[10px] font-bold ${
                      priorSubmission.passed ? "bg-emerald-600" : "bg-amber-600"
                    }`}
                  >
                    {priorSubmission.passed ? "Passed ✓" : "Previous Attempt"}
                  </Badge>
                  <span className="text-[11px] text-slate-300">
                    {new Date(priorSubmission.submitted_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Previous Score: {priorSubmission.score} / {priorSubmission.total_marks} ({priorSubmission.percentage}%)
                </h3>
                <p className="text-xs text-indigo-200">
                  You can inspect the questions you got wrong, review correct answers, and study clinical explanations to learn from your mistakes.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleLoadReview}
                disabled={loadingReview}
                className="w-full sm:w-auto rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-xs h-11 px-5 gap-2 shrink-0 shadow-md"
              >
                {loadingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                )}
                <span>Review Answers & Explanations 📖</span>
              </Button>
            </div>
          </Card>
        )}

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
              {priorSubmission ? "Retake Online Exam Now 🚀" : "Start Online Exam Now 🚀"}
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
                  {currentQ.image_url && (
                    <div className="mt-4 relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 max-h-80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentQ.image_url}
                        alt="Question diagram"
                        onClick={() => {
                          setZoomedImage(currentQ.image_url!);
                          setZoomScale(1);
                        }}
                        className="max-h-72 w-auto object-contain rounded-xl cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setZoomedImage(currentQ.image_url!);
                          setZoomScale(1);
                        }}
                        className="absolute bottom-3 right-3 h-8 px-3 rounded-xl bg-white/95 backdrop-blur hover:bg-white text-slate-800 shadow-md font-bold text-xs gap-1.5 border border-slate-200 opacity-90 group-hover:opacity-100 transition-opacity"
                      >
                        <ZoomIn className="h-3.5 w-3.5 text-blue-600" />
                        <span>Click to Zoom</span>
                      </Button>
                    </div>
                  )}
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

        {/* Interactive Diagram Zoom Modal */}
        {renderZoomDialog()}
      </div>
    );
  }

  // ==========================================
  // 3. POST-EXAM RESULT & QUESTION REVIEW SCREEN
  // ==========================================
  if (examState === "result" && examResult) {
    const passed = Boolean(examResult.passed);
    const reviewItems: QuestionReviewItem[] = examResult.review || [];
    const wrongCount = examResult.wrong_count ?? reviewItems.filter((i) => i.is_wrong).length;
    const correctCount = examResult.correct_count ?? reviewItems.filter((i) => i.is_correct).length;
    const unansweredCount = examResult.unanswered_count ?? reviewItems.filter((i) => i.is_unanswered).length;

    const filteredReview = reviewItems.filter((item) => {
      // Filter by status tab
      if (reviewFilter === "wrong" && !item.is_wrong) return false;
      if (reviewFilter === "correct" && !item.is_correct) return false;
      if (reviewFilter === "unanswered" && !item.is_unanswered) return false;

      // Filter by search text
      if (reviewSearch.trim()) {
        const query = reviewSearch.toLowerCase();
        const textMatch = item.question_text.toLowerCase().includes(query);
        const explMatch = (item.explanation || "").toLowerCase().includes(query);
        const optMatch =
          item.option_a.toLowerCase().includes(query) ||
          item.option_b.toLowerCase().includes(query) ||
          item.option_c.toLowerCase().includes(query) ||
          item.option_d.toLowerCase().includes(query);
        return textMatch || explMatch || optMatch;
      }

      return true;
    });

    const getOptionText = (item: QuestionReviewItem, key: "A" | "B" | "C" | "D") => {
      if (key === "A") return item.option_a;
      if (key === "B") return item.option_b;
      if (key === "C") return item.option_c;
      return item.option_d;
    };

    return (
      <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
            <Link href="/student/exams">
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Link>
          </Button>

          <Button
            onClick={() => {
              setAnswers({});
              setCurrentIdx(0);
              setStartedAt(new Date().toISOString());
              setExamState("taking");
              setSecondsRemaining((exam.duration_minutes || 30) * 60);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            size="sm"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Exam</span>
          </Button>
        </div>

        {/* Scorecard Hero */}
        <Card className="border-slate-200/90 rounded-3xl shadow-xl bg-white overflow-hidden text-center">
          <div
            className={`p-6 sm:p-8 text-white ${
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
            <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              {passed
                ? `You successfully cleared the ${exam.title} assessment!`
                : "Good effort! Carefully review your incorrect answers and clinical explanations below to learn and prepare for your next attempt."}
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Score Highlight Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto">
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
              {examResult.time_taken_seconds && (
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Time taken: {Math.floor(examResult.time_taken_seconds / 60)}m{" "}
                  {examResult.time_taken_seconds % 60}s
                </div>
              )}
            </div>

            {/* Performance Breakdown Tiles */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Correct</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">{correctCount}</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                <div className="text-[10px] font-bold text-rose-800 uppercase">Incorrect</div>
                <div className="text-lg font-black text-rose-700 mt-0.5">{wrongCount}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Skipped</div>
                <div className="text-lg font-black text-slate-700 mt-0.5">{unansweredCount}</div>
              </div>
            </div>

            {/* Quick Action to Focus on Mistakes */}
            {wrongCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-950">
                      You have {wrongCount} incorrect {wrongCount === 1 ? "answer" : "answers"} to learn from
                    </div>
                    <div className="text-[11px] text-rose-800">
                      Filter directly to your mistakes below to review the right answers and rationale.
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setReviewFilter("wrong");
                    const el = document.getElementById("review-analysis-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 h-9 px-4 shadow-sm"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Review Mistakes Only ({wrongCount})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==================================================== */}
        {/* INTERACTIVE QUESTION-BY-QUESTION REVIEW & LEARNING */}
        {/* ==================================================== */}
        <div id="review-analysis-section" className="space-y-4 pt-2">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Exam Answer Key & Learning Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Inspect your answers, see what you got wrong vs. correct, and study faculty rationales to master key topics.
              </p>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setReviewFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                reviewFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>All Questions</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300">
                {reviewItems.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setReviewFilter("wrong")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                reviewFilter === "wrong"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 hover:bg-rose-100/50"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Wrong Answers</span>
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full font-black ${
                  reviewFilter === "wrong" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
                }`}
              >
                {wrongCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setReviewFilter("correct")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                reviewFilter === "correct"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 hover:bg-emerald-100/50"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Correct Answers</span>
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full font-black ${
                  reviewFilter === "correct"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {correctCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setReviewFilter("unanswered")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                reviewFilter === "unanswered"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Skipped</span>
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full font-black ${
                  reviewFilter === "unanswered"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {unansweredCount}
              </span>
            </button>
          </div>

          {/* Search Question Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in questions, answer choices, or explanations..."
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Filtered Questions List */}
          {filteredReview.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 p-8 sm:p-12 text-center bg-white rounded-2xl">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Questions Match Filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {reviewFilter === "wrong"
                  ? "Outstanding! You got 0 questions wrong in this exam!"
                  : "Try clearing your search query or choosing another category above."}
              </p>
              {reviewFilter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReviewFilter("all");
                    setReviewSearch("");
                  }}
                  className="mt-3 rounded-xl font-bold text-xs"
                >
                  View All Questions
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReview.map((item, idx) => {
                const questionNumber = item.order_index != null ? item.order_index + 1 : idx + 1;

                return (
                  <Card
                    key={item.id}
                    className={`border-2 rounded-2xl shadow-xs overflow-hidden transition-all bg-white ${
                      item.is_wrong
                        ? "border-rose-300 ring-1 ring-rose-200/50"
                        : item.is_correct
                        ? "border-emerald-300 ring-1 ring-emerald-200/50"
                        : "border-slate-200"
                    }`}
                  >
                    <CardHeader className="p-4 sm:p-6 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                              item.is_wrong
                                ? "bg-rose-100 text-rose-800"
                                : item.is_correct
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            Question {questionNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {item.marks} {item.marks === 1 ? "Mark" : "Marks"}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {item.is_correct && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold text-xs gap-1.5 py-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Correct (+{item.marks} Marks)</span>
                            </Badge>
                          )}
                          {item.is_wrong && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-extrabold text-xs gap-1.5 py-1">
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>Your Answer: Option {item.student_answer} (Incorrect)</span>
                            </Badge>
                          )}
                          {item.is_unanswered && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-xs gap-1.5 py-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                              <span>Skipped / Not Answered</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        {item.question_text}
                      </CardTitle>

                      {/* Question Diagram if present */}
                      {item.image_url && (
                        <div className="mt-3 relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 max-h-72">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt="Question diagram"
                            onClick={() => {
                              setZoomedImage(item.image_url!);
                              setZoomedTitle(`Question ${questionNumber} Diagram`);
                              setZoomScale(1);
                            }}
                            className="max-h-64 w-auto object-contain rounded-xl cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setZoomedImage(item.image_url!);
                              setZoomedTitle(`Question ${questionNumber} Diagram`);
                              setZoomScale(1);
                            }}
                            className="absolute bottom-3 right-3 h-8 px-3 rounded-xl bg-white/95 backdrop-blur hover:bg-white text-slate-800 shadow-md font-bold text-xs gap-1.5 border border-slate-200"
                          >
                            <ZoomIn className="h-3.5 w-3.5 text-blue-600" />
                            <span>Zoom Diagram</span>
                          </Button>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-2.5">
                      {/* All 4 Choices */}
                      {(["A", "B", "C", "D"] as const).map((optKey) => {
                        const optText = getOptionText(item, optKey);
                        const isStudentPick = item.student_answer === optKey;
                        const isRightOption = item.correct_option === optKey;

                        let cardStyle = "border-slate-200 bg-white text-slate-700";
                        let badgeElement = null;

                        if (isRightOption) {
                          cardStyle = "border-2 border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs";
                          badgeElement = (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 text-[11px] font-black gap-1 shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              {isStudentPick ? "Your Choice (Correct ✓)" : "Correct Answer ✓"}
                            </Badge>
                          );
                        } else if (isStudentPick && !isRightOption) {
                          cardStyle = "border-2 border-rose-500 bg-rose-50/70 text-rose-950 font-semibold shadow-xs";
                          badgeElement = (
                            <Badge className="bg-rose-600 hover:bg-rose-600 text-white border-0 text-[11px] font-black gap-1 shrink-0">
                              <XCircle className="h-3 w-3" />
                              Your Choice (Wrong ✗)
                            </Badge>
                          );
                        }

                        return (
                          <div
                            key={optKey}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${cardStyle}`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              <div
                                className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                  isRightOption
                                    ? "bg-emerald-600 text-white"
                                    : isStudentPick
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {optKey}
                              </div>
                              <span className="font-semibold text-xs sm:text-sm leading-snug break-words">
                                {optText}
                              </span>
                            </div>
                            {badgeElement}
                          </div>
                        );
                      })}

                      {/* Clinical Rationale & Explanation Card for Learning */}
                      <div className="mt-3.5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-1.5 font-black text-xs text-amber-900 uppercase tracking-wide">
                          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>Clinical Rationale & Learning Concept</span>
                        </div>
                        {item.explanation ? (
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {item.explanation}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            The correct answer is <span className="font-bold text-slate-900">Option {item.correct_option}</span>: &ldquo;{getOptionText(item, item.correct_option)}&rdquo;. Make sure to revise your lecture materials and notes on this topic to strengthen your conceptual foundation.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom Navigation CTAs */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl font-bold text-xs">
              <Link href="/student/exams">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Exams List
              </Link>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-1/2 sm:w-auto rounded-xl font-bold text-xs"
              >
                Back to Top ↑
              </Button>
              <Button
                onClick={() => {
                  setAnswers({});
                  setCurrentIdx(0);
                  setStartedAt(new Date().toISOString());
                  setExamState("taking");
                  setSecondsRemaining((exam.duration_minutes || 30) * 60);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-1/2 sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Retake Exam 🚀
              </Button>
            </div>
          </div>
        </div>

        {/* Zoom modal shared with review mode */}
        {renderZoomDialog()}
      </div>
    );
  }

  return null;
}

