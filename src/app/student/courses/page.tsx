"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dummyCourses, dummyStudents } from "@/lib/dummy-data";
import {
  PlayCircle,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  Search,
  BookOpen,
  Filter,
  ArrowRight,
  BarChart3,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, initials, formatProgress } from "@/lib/utils";

export default function StudentCoursesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");

  const myCourses = dummyCourses.map((c, i) => ({
    ...c,
    progress: [68, 42, 85, 27, 55, 72, 15][i] || 0,
    category: ["Recruitment", "Recruitment", "Recruitment", "Entrance", "Recruitment", "Entrance", "Lecturer"][i] || "Recruitment",
    lectures: [42, 36, 28, 50, 22, 38, 30][i] || 30,
    completed: [28, 15, 24, 13, 12, 27, 4][i] || 0,
  }));

  const filteredCourses = myCourses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Courses 📚
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base">
            Continue learning. You&apos;re enrolled in {myCourses.length} programs.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="pl-10 h-10 sm:h-11 w-full sm:w-64 text-xs sm:text-sm"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-xs font-semibold text-slate-500 h-8"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <TabsList className="h-auto flex-wrap sm:h-11 bg-slate-100 p-1 sm:p-1.5 gap-1 w-full sm:w-auto">
            <TabsTrigger value="all" className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold flex-1 sm:flex-initial">
              All ({filteredCourses.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold flex-1 sm:flex-initial">
              In Progress ({filteredCourses.filter((c) => c.progress > 0 && c.progress < 100).length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold flex-1 sm:flex-initial">
              Completed ({filteredCourses.filter((c) => c.progress >= 100).length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold flex-1 sm:flex-initial">
              Favorites (2)
            </TabsTrigger>
          </TabsList>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5 sm:gap-2">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Avg Progress: <span className="text-aims-green font-extrabold text-xs sm:text-base">58%</span>
          </div>
        </div>

        <TabsContent value="all" className="mt-0 space-y-0">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">No matching courses</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                We couldn&apos;t find any programs matching &quot;{searchTerm}&quot;.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6">
              {filteredCourses.map((course, idx) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge
                      variant={
                        course.category === "Recruitment"
                          ? "default"
                          : course.category === "Entrance"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm"
                    >
                      {course.category === "Lecturer" ? "Lecturer & Tutor" : course.category + " Exam"}
                    </Badge>
                    {course.progress >= 100 && (
                      <Badge variant="success" className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm bg-white/95">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    )}
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/40 backdrop-blur-sm">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white shadow-2xl flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300">
                      <PlayCircle className="h-5 w-5 sm:h-7 sm:w-7 text-aims-navy ml-0.5 sm:ml-1" fill="currentColor" />
                    </div>
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between text-white">
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold drop-shadow-md">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" />
                        {course.completed}/{course.lectures}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.lectures * 1.2}h
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold drop-shadow-md">
                      {formatProgress(course.progress)}
                    </div>
                  </div>
                </div>
                <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-extrabold leading-tight text-slate-900 group-hover:text-aims-navy transition-colors line-clamp-2 min-h-0 sm:min-h-[3.5rem]">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-5 pt-0 space-y-3 sm:space-y-4">
                  <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 min-h-0 sm:min-h-[2.5rem]">
                    {course.description}
                  </CardDescription>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
                      <span className="text-slate-500">Your Progress</span>
                      <span
                        className={cn(
                          course.progress >= 80
                            ? "text-aims-green"
                            : course.progress >= 50
                            ? "text-aims-navy"
                            : "text-amber-600"
                        )}
                      >
                        {formatProgress(course.progress)}
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-1.5 sm:h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-white shadow-sm">
                        <AvatarImage
                          src={course.instructor?.avatar_url || ""}
                          alt={course.instructor?.full_name || ""}
                        />
                        <AvatarFallback className="text-[9px] sm:text-[10px] font-bold">
                          {initials(course.instructor?.full_name || "Faculty")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="text-xs font-bold text-slate-700">
                          {course.instructor?.full_name || "Expert Faculty"}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Instructor
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Users className="h-3 w-3" />
                      {40 + idx * 3}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3.5 sm:p-5 pt-0 mt-auto flex gap-2 sm:gap-3">
                  <Button variant="primary" size="sm" className="flex-1 gap-1.5 h-9 sm:h-10 text-xs sm:text-sm" asChild>
                    <Link href={`/student/courses/${course.id}`}>
                      {course.progress === 0 ? "Start Learning" : "Continue"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 border-slate-200"
                  >
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-0">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCourses
              .filter((c) => c.progress > 0 && c.progress < 100)
              .map((course, idx) => (
                <Card
                  key={course.id}
                  className="group overflow-hidden border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-40 aspect-[16/10] sm:aspect-auto overflow-hidden">
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <Badge variant="outline" className="text-[10px] font-bold mb-2">
                        {course.category}
                      </Badge>
                      <h3 className="font-extrabold text-slate-900 mb-2 leading-tight">
                        {course.title}
                      </h3>
                      <Progress value={course.progress} className="h-2 mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-aims-navy">
                          {formatProgress(course.progress)}
                        </span>
                        <Button size="sm" variant="secondary" className="gap-1.5 h-8" asChild>
                          <Link href={`/student/courses/${course.id}`}>
                            Resume
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCourses
              .filter((c) => c.progress >= 100)
              .map((course) => (
                <Card key={course.id} className="overflow-hidden border-aims-green/20 bg-aims-green/[0.02]">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-aims-green/15 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-aims-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="success" className="mb-2 text-[10px] font-bold">
                        Completed
                      </Badge>
                      <h3 className="font-extrabold text-slate-900 leading-tight mb-0.5 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Certificate issued · Score: {92 + (parseInt(course.id.slice(1)) % 7)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {myCourses.filter((c) => c.progress >= 100).length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 text-center py-20 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-1">No completed courses yet</h3>
                <p className="text-sm text-slate-500 mb-4">Keep going! You&apos;ll get there soon 💪</p>
                <Button variant="primary" onClick={() => setActiveTab("all")}>Browse My Courses</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCourses.slice(0, 2).map((course) => (
              <Card
                key={`fav-${course.id}`}
                className="group overflow-hidden border-amber-200/60 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
              >
                <div className="relative overflow-hidden aspect-[16/10]">
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500 text-white font-bold gap-1 shadow-md">
                      <Star className="h-3 w-3 fill-white" /> Starred
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <Badge variant="outline" className="text-[10px] font-bold mb-2 w-fit">
                    {course.category}
                  </Badge>
                  <h3 className="font-extrabold text-slate-900 text-base mb-2 leading-tight">
                    {course.title}
                  </h3>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Progress: {course.progress}%
                    </span>
                    <Button size="sm" variant="primary" asChild className="gap-1 h-8 text-xs font-bold">
                      <Link href={`/student/courses/${course.id}`}>
                        Continue <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
