"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MessageCircle,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Loader2,
  RotateCw,
} from "lucide-react";
import { initials } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { subscribeToDataRefresh } from "@/lib/refresh-event";

export default function InstructorStudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        fetch("/api/courses", { cache: "no-store" }),
        fetch("/api/admin/enrollments", { cache: "no-store" }),
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        if (cData.courses && Array.isArray(cData.courses)) {
          setCourses(cData.courses);
        }
      }

      if (enrollRes.ok) {
        const eData = await enrollRes.json();
        if (Array.isArray(eData)) {
          setEnrollments(eData);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchData();
    });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const studentList = enrollments.map((enr) => ({
    id: enr.id,
    studentId: enr.student?.id || enr.student_id,
    full_name: enr.student?.full_name || "Enrolled Student",
    email: enr.student?.email || "—",
    phone: enr.student?.whatsapp || "—",
    avatar_url: enr.student?.avatar_url || "",
    courseId: enr.course?.id || enr.course_id,
    courseTitle: enr.course?.title || "Nursing Course",
    enrolled_at: enr.enrolled_at,
    progress: enr.progress || 0,
    status: "Active",
  }));

  const filteredStudents = studentList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesCourse = selectedCourse === "all" || s.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const uniqueStudentIds = new Set(enrollments.map((e) => e.student_id).filter(Boolean));

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no student records currently matching the filter.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Enrollment ID", "Student Name", "Email", "Phone", "Course", "Enrolled Date", "Status"];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.full_name}"`,
      s.email,
      s.phone,
      `"${s.courseTitle}"`,
      s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString("en-IN") : "—",
      s.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `aims_students_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Roster Exported 📊",
      description: `Downloaded ${filteredStudents.length} student records as CSV.`,
      variant: "success",
    });
  };

  const summary = [
    { label: "Total Enrollments", value: enrollments.length, color: "text-aims-navy", bg: "bg-aims-navy/10", icon: Users },
    { label: "Unique Students", value: uniqueStudentIds.size, color: "text-aims-green", bg: "bg-aims-green/10", icon: GraduationCap },
    { label: "Active Courses", value: courses.length, color: "text-blue-600", bg: "bg-blue-100", icon: BookOpen },
    { label: "Verified Roster", value: "100%", color: "text-emerald-600", bg: "bg-emerald-50", icon: Calendar },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Students 👨‍🎓
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            {enrollments.length} active enrollments across {courses.length} courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="gap-2 h-11 px-4 cursor-pointer font-bold border-slate-200"
          >
            <RotateCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="gap-2 h-11 px-4 cursor-pointer font-bold border-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="group overflow-hidden border-slate-100 hover:shadow-lg transition-all"
            >
              <CardContent className="p-5 md:p-6 flex items-center gap-4">
                <div
                  className={`h-12 w-12 shrink-0 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? "—" : s.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                    {s.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-100 overflow-hidden shadow-xs">
        <CardHeader className="p-5 md:p-6 border-b border-slate-100 flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div>
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              Enrolled Student Directory
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Real-time student course registrations and verified contact details
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="pl-10 h-11 w-full sm:w-64 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-11 w-full sm:w-56 gap-2 rounded-xl text-xs sm:text-sm font-semibold">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses ({courses.length})</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-aims-green" />
              Loading student directory...
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Phone / Contact</TableHead>
                      <TableHead>Enrolled On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Connect</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16 text-slate-400 font-semibold">
                          No enrolled students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((s) => (
                        <TableRow key={s.id} className="group/row hover:bg-slate-50/80">
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-white shadow-xs">
                                <AvatarImage src={s.avatar_url} />
                                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                                  {initials(s.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 leading-tight truncate">
                                  {s.full_name}
                                </div>
                                <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                  {s.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold text-slate-800 max-w-[220px] truncate">
                              {s.courseTitle}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-bold text-slate-600">
                              {s.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-slate-500">
                              {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success" className="text-[11px] font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                              Enrolled
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                              {s.email && s.email !== "—" && (
                                <a
                                  href={`mailto:${s.email}`}
                                  title={`Email ${s.full_name}`}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-aims-navy hover:bg-aims-navy/10 transition-colors"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {s.phone && s.phone !== "—" && (
                                <>
                                  <a
                                    href={`tel:${s.phone}`}
                                    title={`Call ${s.full_name}`}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-aims-green hover:bg-aims-green/10 transition-colors"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                  <a
                                    href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`WhatsApp ${s.full_name}`}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </a>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid sm:grid-cols-2 lg:hidden gap-3 p-4">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm">
                    No enrolled students found.
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <Card key={s.id} className="border-slate-100 overflow-hidden shadow-none">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-11 w-11 ring-2 ring-white shadow-xs">
                            <AvatarImage src={s.avatar_url} />
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                              {initials(s.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 truncate leading-tight text-sm">
                                {s.full_name}
                              </h4>
                              <Badge variant="success" className="text-[10px] font-bold shrink-0">
                                Enrolled
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {s.courseTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">
                            {s.phone}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString("en-IN") : "—"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
