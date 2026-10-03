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
import {
  Clock,
  Award,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCcw,
  Loader2,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Exam, Course } from "@/lib/types";

export default function StudentExamsListPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const loadData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([
        fetch("/api/exams", { cache: "no-store" }),
        fetch("/api/courses", { cache: "no-store" }),
      ]);

      if (examsRes.ok) {
        const data = await examsRes.json();
        if (Array.isArray(data)) setExams(data);
      }

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        if (cData.courses && Array.isArray(cData.courses)) setCourses(cData.courses);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading exams",
        description: "Failed to connect to assessment server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredExams = exams.filter((e) => {
    const matchesCourse = courseFilter === "all" || e.course_id === courseFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(term) ||
      (e.course?.title || "").toLowerCase().includes(term);
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Online CBT Mock Test Series</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Online MCQ Exams 📝
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Take timed, recruitment-pattern mock tests designed by AIMS faculty and get instant verified results.
        </p>
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
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Loading available exams...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 py-16 text-center">
          <CardContent className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Exams Scheduled Yet</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Faculty will schedule MCQ assessments for your courses soon. Please check back shortly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredExams.map((exam) => {
            const sub = exam.user_submission;
            const hasAttempted = Boolean(sub);

            return (
              <Card
                key={exam.id}
                className="border-slate-200/90 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between bg-white"
              >
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="font-bold text-[10px] bg-slate-50 text-blue-800 border-blue-200 max-w-[200px] truncate"
                    >
                      {exam.course?.title || "Exam Series"}
                    </Badge>
                    {hasAttempted ? (
                      sub?.passed ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Passed ({sub.percentage}%)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Score: {sub?.percentage}%
                        </Badge>
                      )
                    ) : (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                        Ready to Take
                      </Badge>
                    )}
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
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Questions</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {exam.questions_count || 0}
                      </div>
                    </div>
                    <div className="border-x border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {exam.duration_minutes}m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Pass Mark</div>
                      <div className="text-sm font-black text-blue-600 mt-0.5">
                        {exam.pass_percentage}%
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <Button
                    asChild
                    size="sm"
                    className={`w-full h-10 rounded-xl font-bold text-xs gap-2 ${
                      hasAttempted
                        ? "bg-slate-800 hover:bg-slate-900 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                    }`}
                  >
                    <Link href={`/student/exams/${exam.id}`}>
                      {hasAttempted ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Re-attempt Exam</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          <span>Start Exam Now</span>
                        </>
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
