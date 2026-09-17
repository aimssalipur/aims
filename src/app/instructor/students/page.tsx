"use client";

import { useState } from "react";
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
  TrendingUp,
  Award,
  ChevronDown,
  BookOpenCheck,
} from "lucide-react";
import { dummyStudents, dummyCourses } from "@/lib/dummy-data";
import { initials } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function InstructorStudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const myCourses = dummyCourses;

  const allStudents = dummyStudents.slice(0, 18).map((s, i) => ({
    ...s,
    phone: (s as any).phone || s.whatsapp || "+91 94379 59054",
    courseId: myCourses[i % myCourses.length].id,
    course: myCourses[i % myCourses.length].title,
    progress: [92, 88, 76, 95, 65, 42, 78, 81, 85, 58, 88, 91, 73, 67, 82, 90, 70, 60][i],
    attendance: [98, 95, 92, 99, 88, 85, 94, 96, 90, 82, 97, 95, 89, 91, 93, 96, 87, 84][i],
    gpa: ["9.8", "9.6", "9.1", "9.9", "8.7", "8.0", "9.3", "9.4", "9.0", "8.2", "9.7", "9.6", "8.8", "9.0", "9.2", "9.5", "8.6", "8.3"][i],
    status: ["Active", "Active", "Active", "Active", "Active", "At Risk", "Active", "Active", "Active", "At Risk", "Active", "Active", "Active", "Active", "Active", "Active", "Active", "At Risk"][i],
  }));

  const filteredStudents = allStudents.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || s.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Course", "Progress (%)", "Attendance (%)", "GPA", "Status"];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.full_name}"`,
      s.email,
      s.phone,
      `"${s.course}"`,
      s.progress,
      s.attendance,
      s.gpa,
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
    { label: "Total Students", value: "144", color: "bg-aims-green text-aims-green", bg: "bg-aims-green/10" },
    { label: "Active This Week", value: "132", color: "text-blue-600", bg: "bg-blue-100" },
    { label: "At Risk", value: "6", color: "text-red-600", bg: "bg-red-50" },
    { label: "Avg GPA", value: "9.1", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Students 👨‍🎓
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            {allStudents.length} students enrolled across {myCourses.length} courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="lg"
            className="gap-2 h-11 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {summary.map((s) => (
          <Card
            key={s.label}
            className="group overflow-hidden border-slate-100 hover:shadow-lg transition-all"
          >
            <CardContent className="p-5 md:p-6 flex items-center gap-4">
              <div
                className={`h-12 w-12 shrink-0 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  {s.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-100 overflow-hidden">
        <CardHeader className="p-5 md:p-6 border-b border-slate-100 flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div>
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              Student Directory
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Monitor progress, attendance, and contact students
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="pl-10 h-11 w-full sm:w-64"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-11 w-full sm:w-52 gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {myCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title.slice(0, 24)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      No students matching your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={s.id} className="group/row">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={s.avatar_url!} />
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                              {initials(s.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 leading-tight truncate">
                              {s.full_name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate">
                              {s.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-700 max-w-[180px] truncate">
                          {s.course}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Progress
                            value={s.progress}
                            className="h-1.5 max-w-[160px]"
                          />
                          <div className="flex items-center justify-between text-[11px] font-bold max-w-[160px]">
                            <span className="text-slate-500">{s.progress}%</span>
                            {s.progress >= 80 && (
                              <span className="text-aims-green flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.attendance >= 90 ? "success" : s.attendance >= 75 ? "warning" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {s.attendance}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-extrabold text-lg ${
                            parseFloat(s.gpa) >= 9.5
                              ? "text-amber-600"
                              : parseFloat(s.gpa) >= 8.5
                              ? "text-aims-green"
                              : parseFloat(s.gpa) >= 7.0
                              ? "text-aims-navy"
                              : "text-slate-600"
                          }`}
                        >
                          {s.gpa}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.status === "Active" ? "success" : "destructive"}
                          className={`text-xs font-bold ${
                            s.status !== "Active" && "animate-pulse"
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                          <a
                            href={`mailto:${s.email}`}
                            title={`Email ${s.full_name}`}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-aims-navy hover:bg-aims-navy/10 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile cards */}
          <div className="grid sm:grid-cols-2 lg:hidden gap-4 p-5">
            {filteredStudents.map((s) => (
              <Card key={s.id} className="border-slate-100 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={s.avatar_url!} />
                      <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-aims-navy to-aims-green text-white">
                        {initials(s.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 truncate leading-tight">
                          {s.full_name}
                        </h4>
                        <Badge variant={s.status === "Active" ? "success" : "destructive"} className="text-[10px] font-bold shrink-0">
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {s.course}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</div>
                      <div className="font-extrabold text-slate-900">{s.progress}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attend</div>
                      <div className="font-extrabold text-aims-green">{s.attendance}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GPA</div>
                      <div className="font-extrabold text-amber-600">{s.gpa}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
