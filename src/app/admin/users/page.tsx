"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  UserPlus,
  Shield,
  GraduationCap,
  UserCircle,
  MoreHorizontal,
  Download,
  Filter,
  Trash2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  DollarSign,
  Loader2,
  RotateCw,
  BookOpen,
  UserCheck,
  Power,
  PowerOff,
  Activity,
  Clock,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { initials, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";
import { subscribeToDataRefresh } from "@/lib/refresh-event";
import { formatLastSeen, formatDuration } from "@/lib/activity-utils";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "student",
    password: "AIMS@2026!",
  });

  const [courses, setCourses] = useState<any[]>([]);

  // Student Course Enrollment State
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState("");
  const [enrollingStudent, setEnrollingStudent] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  // Faculty Course Assignment State
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState("");
  const [assigningStaff, setAssigningStaff] = useState(false);

  // Student Basic Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any>(null);

  const openStudentDetails = (student: any) => {
    setSelectedStudentForDetails(student);
    setDetailsModalOpen(true);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses", { cache: "no-store" });
      const data = await response.json();
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
      }
    });
    fetchUsers();
    fetchCourses();
  }, []);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchUsers();
      fetchCourses();
    });
  }, []);

  const openEnrollModal = async (student: any) => {
    setSelectedStudent(student);
    setSelectedCourseToEnroll("");
    setEnrollModalOpen(true);
    setLoadingEnrollments(true);
    try {
      const res = await fetch(`/api/admin/enrollments?student_id=${student.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudentEnrollments(data);
      } else {
        setStudentEnrollments([]);
      }
    } catch (err) {
      console.error(err);
      setStudentEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedCourseToEnroll) {
      toast({
        title: "Course Selection Required",
        description: "Please choose a course to enroll the student.",
        variant: "destructive",
      });
      return;
    }

    setEnrollingStudent(true);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: selectedCourseToEnroll,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast({
          title: "Enrollment Failed",
          description: data.error || "Could not complete enrollment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrolled Successfully ✅",
          description: data.message || `Student enrolled successfully.`,
          variant: "success",
        });
        setSelectedCourseToEnroll("");
        // Reload student's enrollments
        const freshRes = await fetch(`/api/admin/enrollments?student_id=${selectedStudent.id}`);
        const freshData = await freshRes.json();
        if (Array.isArray(freshData)) setStudentEnrollments(freshData);
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Enrollment Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setEnrollingStudent(false);
    }
  };

  const handleUnenrollStudent = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to remove this course enrollment?")) return;
    setUnenrollingId(enrollmentId);
    try {
      const res = await fetch(`/api/admin/enrollments?id=${enrollmentId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast({
          title: "Failed to Unenroll",
          description: data.error || "Could not remove enrollment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrollment Removed ✅",
          description: "Student unenrolled from course.",
          variant: "success",
        });
        setStudentEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUnenrollingId(null);
    }
  };

  const openStaffModal = (staff: any) => {
    setSelectedStaff(staff);
    setSelectedCourseToAssign("");
    setStaffModalOpen(true);
  };

  const handleAssignFaculty = async (courseId: string, instructorId: string | null) => {
    setAssigningStaff(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructor_id: instructorId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast({
          title: "Assignment Failed",
          description: data.error || "Unable to update faculty assignment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: instructorId ? "Course Assigned to Faculty ✅" : "Faculty Assignment Cleared",
          description: instructorId
            ? "Faculty member designated as course lead."
            : "Course unassigned from faculty member.",
          variant: "success",
        });
        setSelectedCourseToAssign("");
        fetchCourses();
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchUsers();
      await fetchCourses();
      toast({
        title: "Users List Updated ✅",
        description: "Latest user records and approvals loaded.",
        variant: "success",
      });
    } catch {}
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCreateUser = async () => {
    if (creatingUser) return;

    if (!form.fullName || !form.email || !form.password) {
      toast({
        title: "Missing details",
        description: "Please enter a name, email, and password.",
        variant: "destructive",
      });
      return;
    }
    
    setCreatingUser(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to create user",
          description: getFriendlyErrorMessage(data.error || "Unable to create user account."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "User created ✅",
          description: `Account has been created successfully.`,
          variant: "success",
        });
        setAddOpen(false);
        fetchUsers();
        setForm({
          fullName: "",
          email: "",
          phone: "",
          role: "student",
          password: "AIMS@2026!",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error creating user",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Are you sure you want to remove this user?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to delete user",
          description: getFriendlyErrorMessage(data.error || "Unable to remove user account."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "User removed ✅",
          description: "The user has been successfully removed.",
          variant: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Error deleting user",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleRole = async (userId: string, targetRole: string, currentRoles: string[]) => {
    if (roleUpdatingId) return;

    let newRoles = [...(currentRoles || [])];
    if (newRoles.includes(targetRole)) {
      if (newRoles.length === 1) {
        toast({
          title: "Cannot remove role",
          description: "A user must have at least one assigned role.",
          variant: "destructive",
        });
        return;
      }
      newRoles = newRoles.filter((r) => r !== targetRole);
    } else {
      newRoles.push(targetRole);
    }

    setRoleUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, roles: newRoles }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to update roles",
          description: getFriendlyErrorMessage(data.error || "Unable to update roles."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Roles updated ✅",
          description: "User roles have been updated successfully.",
          variant: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Error updating role",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (approvingId) return;

    setApprovingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, approved: true }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to approve user",
          description: getFriendlyErrorMessage(data.error || "Unable to approve student account."),
          variant: "destructive",
        });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, approved: true, roles: u.roles?.length ? u.roles : ["student"] } : u))
        );
        toast({
          title: "User approved ✅",
          description: "Student application has been approved and account activated.",
          variant: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Approval Error",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleSetActive = async (userId: string, targetActive: boolean) => {
    if (togglingActiveId) return;

    if (userId === currentUserId && !targetActive) {
      toast({
        title: "Action Restricted",
        description: "You cannot deactivate your own active administrator account.",
        variant: "destructive",
      });
      return;
    }

    const actionText = targetActive ? "activate" : "deactivate";

    if (
      !confirm(
        `Are you sure you want to ${actionText} this user? ${
          targetActive
            ? "Their account will be active and can access assigned courses."
            : "Their account will be inactive and blocked from accessing courses and internal dashboards (they can only view the public main site)."
        }`
      )
    ) {
      return;
    }

    setTogglingActiveId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, is_active: targetActive }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to update user status",
          description: getFriendlyErrorMessage(data.error || "Unable to update active status."),
          variant: "destructive",
        });
      } else {
        toast({
          title: targetActive ? "User Activated ✅" : "User Deactivated ⛔",
          description: targetActive
            ? "User account is now active and can access assigned courses."
            : "User is now inactive. They can only see the main site and are blocked from courses.",
          variant: "success",
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: targetActive } : u))
        );
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Status Update Error",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActiveStatus: boolean) => {
    return handleSetActive(userId, !currentActiveStatus);
  };

  const renderRoleBadges = (u: any) => {
    const userRoles = u.roles || [u.role];
    return (
      <div className="flex flex-wrap items-center gap-1">
        {userRoles.map((role: string) => {
          if (role === "admin") {
            return (
              <Badge key={role} variant="warning" className="text-[10px] font-bold px-2 py-0.5">
                <Shield className="h-2.5 w-2.5 mr-1 shrink-0" />
                Admin
              </Badge>
            );
          }
          if (role === "instructor") {
            return (
              <Badge key={role} variant="success" className="text-[10px] font-bold px-2 py-0.5">
                <GraduationCap className="h-2.5 w-2.5 mr-1 shrink-0" />
                Instructor
              </Badge>
            );
          }
          if (role === "accountant") {
            return (
              <Badge key={role} variant="indigo" className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                <DollarSign className="h-2.5 w-2.5 mr-1 shrink-0" />
                Accountant
              </Badge>
            );
          }
          return (
            <button
              key={role}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openStudentDetails(u);
              }}
              title="Click to view student details (Name, email, mobile, courses)"
              className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-aims-navy border border-blue-200 hover:bg-aims-navy hover:text-white transition-all cursor-pointer shadow-2xs group/btn active:scale-95 select-none"
            >
              <UserCircle className="h-2.5 w-2.5 shrink-0 group-hover/btn:scale-110 transition-transform" />
              <span>Student</span>
              <span className="text-[9px] opacity-70 underline ml-0.5 font-normal">info</span>
            </button>
          );
        })}
      </div>
    );
  };

  const isUserOnline = (u: any) => {
    if (!u || !u.last_seen_at) return false;
    const diffSec = Math.floor((Date.now() - new Date(u.last_seen_at).getTime()) / 1000);
    return diffSec >= 0 && diffSec < 300;
  };

  const isUserActiveToday = (u: any) => {
    if (!u) return false;
    if ((u.time_spent_today_seconds || 0) > 0) return true;
    if ((u.total_time_spent_seconds || 0) === 0) return false;
    if (!u.last_seen_at) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(u.last_seen_at).getTime() >= today.getTime();
  };

  const isUserActiveThisMonth = (u: any) => {
    if (!u) return false;
    if ((u.time_spent_month_seconds || 0) > 0) return true;
    if ((u.total_time_spent_seconds || 0) === 0) return false;
    if (!u.last_seen_at) return false;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return new Date(u.last_seen_at).getTime() >= startOfMonth.getTime();
  };

  const totalStudents = users.filter((u) => (u.roles?.includes("student") || u.role === "student") && u.approved !== false).length;
  const totalFaculty = users.filter((u) => u.roles?.includes("instructor") || u.role === "instructor").length;
  const totalAdmins = users.filter((u) => u.roles?.includes("admin") || u.role === "admin").length;
  const totalPending = users.filter((u) => u.approved === false).length;
  const totalInactive = users.filter((u) => u.is_active === false).length;
  const totalOnline = users.filter(isUserOnline).length;
  const totalDau = users.filter(isUserActiveToday).length;
  const totalMau = users.filter(isUserActiveThisMonth).length;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, grad: "from-amber-500 to-orange-600", ring: "bg-amber-50", col: "text-amber-600" },
    { label: "Students", value: totalStudents, icon: UserCircle, grad: "from-aims-navy to-blue-700", ring: "bg-aims-navy/10", col: "text-aims-navy" },
    { label: "Faculty", value: totalFaculty, icon: GraduationCap, grad: "from-aims-green to-teal-600", ring: "bg-aims-green/10", col: "text-aims-green" },
    { label: "Pending Applications", value: totalPending, icon: CheckCircle2, grad: "from-purple-500 to-violet-700", ring: "bg-purple-50", col: "text-purple-600" },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.whatsapp?.includes(searchTerm);
      
    const matchesRole = roleFilter === "all" || u.roles?.includes(roleFilter) || u.role === roleFilter;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "online" && isUserOnline(u)) ||
      (activeTab === "admins" && (u.roles?.includes("admin") || u.role === "admin")) ||
      (activeTab === "instructors" && (u.roles?.includes("instructor") || u.role === "instructor")) ||
      (activeTab === "accountants" && (u.roles?.includes("accountant") || u.role === "accountant")) ||
      (activeTab === "students" && (u.roles?.includes("student") || u.role === "student") && u.approved !== false) ||
      (activeTab === "pending" && u.approved === false) ||
      (activeTab === "inactive" && u.is_active === false);

    return matchesSearch && matchesRole && matchesTab;
  });

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management 👥
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base">
            Manage students, faculty, and admin accounts
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3 sm:px-4 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            title="Refresh Users List (without page reload)"
          >
            <RotateCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 shadow-lg shadow-amber-600/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900">Add New User</DialogTitle>
                <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
                  Create a new account and assign a role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2 sm:py-3">
                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <Label className="font-semibold text-xs sm:text-sm">Full Name <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="e.g. Priyanka Mishra"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">Email <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="name@aims.edu"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">WhatsApp Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <Label className="font-semibold text-xs sm:text-sm">Role <span className="text-rose-500">*</span></Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) => setForm({ ...form, role: val })}
                  >
                    <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor / Faculty</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <Label className="font-semibold text-xs sm:text-sm">Temporary Password <span className="text-rose-500">*</span></Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  disabled={creatingUser}
                  onClick={() => setAddOpen(false)}
                  className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={creatingUser}
                  onClick={handleCreateUser}
                  className="w-full sm:w-auto min-w-[130px] rounded-xl h-10 sm:h-11 font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20"
                >
                  {creatingUser ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-3 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <div className={`h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl ${s.ring} ${s.col} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                      {s.value}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5 truncate">
                      {s.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Activity & Engagement Bar (DAU, MAU, Live Online RN) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-aims-navy text-white rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
              <span>Platform Activity & Usage</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Lightweight Supabase tracking · Live heartbeats only when students are actively interacting
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("online")}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-white/10 transition-colors text-left"
            title="Click to view only online users"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Online RN</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">{totalOnline} Active</span>
            </div>
          </button>

          <div className="h-7 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">DAU (Today)</span>
            <span className="text-xs sm:text-sm font-black text-sky-300">{totalDau} Students</span>
          </div>

          <div className="h-7 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">MAU (Month)</span>
            <span className="text-xs sm:text-sm font-black text-purple-300">{totalMau} Active</span>
          </div>
        </div>
      </div>

      <Card className="border-slate-100 overflow-hidden">
        <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-slate-100 flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="md:max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <Input
                placeholder="Search by name, email, phone..."
                className="pl-12 h-12 text-sm font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-11 w-40 gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="Role filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="instructor">Instructors</SelectItem>
                <SelectItem value="accountant">Accountants</SelectItem>
                <SelectItem value="student">Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <div className="px-5 md:px-6 pt-5 border-b border-slate-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent p-0 gap-1 h-auto flex-wrap">
              {["all", "online", "students", "pending", "instructors", "accountants", "admins", "inactive"].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="capitalize h-10 px-4 rounded-xl text-xs md:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100 transition-all"
                >
                  {t === "all" && "All Users"}
                  {t === "online" && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online ({totalOnline})
                    </span>
                  )}
                  {t === "students" && "Students"}
                  {t === "pending" && `Pending Applications (${totalPending}) ⏳`}
                  {t === "instructors" && "Instructors"}
                  {t === "accountants" && "Accountants"}
                  {t === "admins" && "Admins"}
                  {t === "inactive" && `Inactive (${totalInactive}) ⛔`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="hidden lg:block">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-semibold">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-semibold">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5 py-2.5">Student / User</TableHead>
                  <TableHead className="py-2.5">Role</TableHead>
                  <TableHead className="py-2.5">Course</TableHead>
                  <TableHead className="py-2.5">Status</TableHead>
                  <TableHead className="pr-5 py-2.5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <TableRow key={u.id} className="group/row hover:bg-slate-50/80 transition-colors">
                      <TableCell className="pl-5 py-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <Avatar className="h-8 w-8 ring-1 ring-slate-200 shadow-xs">
                              <AvatarImage src={u.avatar_url || ""} />
                              <AvatarFallback
                                className={`text-[10px] font-bold text-white bg-gradient-to-br ${
                                  isAdmin
                                    ? "from-amber-500 to-orange-600"
                                    : u.role === "instructor"
                                    ? "from-aims-green to-teal-600"
                                    : "from-aims-navy to-blue-700"
                                }`}
                              >
                                {initials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            {isUserOnline(u) && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                                title="Online right now"
                              />
                            )}
                          </div>
                          <div className="min-w-0 py-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => openStudentDetails(u)}
                                className="font-extrabold text-slate-900 hover:text-blue-600 text-xs sm:text-sm hover:underline cursor-pointer text-left leading-snug"
                                title="Click to view student details"
                              >
                                {u.full_name}
                              </button>
                              {isUserOnline(u) && (
                                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-1 py-0.2 rounded-sm shrink-0">
                                  Live
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium break-all mt-0.5">
                              {u.email}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {isUserOnline(u) ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Online now
                                </span>
                              ) : u.last_seen_at ? (
                                <span className="text-slate-500 font-semibold">
                                  Active {formatLastSeen(u.last_seen_at).text}
                                </span>
                              ) : (
                                <span className="text-slate-400">Offline</span>
                              )}
                              {(u.time_spent_today_seconds || 0) > 0 && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-blue-600 font-semibold" title="Time spent today">
                                    {formatDuration(u.time_spent_today_seconds)} today
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">{renderRoleBadges(u)}</TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs font-semibold text-slate-700 leading-snug">
                          {(u.roles?.includes("admin") || u.role === "admin") && "Management & Operations"}
                          {(u.roles?.includes("accountant") || u.role === "accountant") && !u.roles?.includes("admin") && "Finance & Ledger"}
                          {(u.roles?.includes("instructor") || u.role === "instructor") && !u.roles?.includes("admin") && !u.roles?.includes("accountant") && (u.course_of_interest || "Faculty")}
                          {(u.roles?.includes("student") || u.role === "student") && !u.roles?.includes("instructor") && !u.roles?.includes("accountant") && !u.roles?.includes("admin") && (
                            u.enrollments && u.enrollments.length > 0 ? (
                              <div
                                className="inline-flex items-center gap-1 text-emerald-700 font-bold flex-wrap"
                                title={u.enrollments.map((e: any) => e.course?.title).filter(Boolean).join(", ")}
                              >
                                <BookOpen className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{u.enrollments[0]?.course?.title || "Enrolled"}</span>
                                {u.enrollments.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => openStudentDetails(u)}
                                    className="text-[10px] text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded-full shrink-0 font-extrabold cursor-pointer transition-colors"
                                    title="Click to view all enrolled courses"
                                  >
                                    +{u.enrollments.length - 1} more
                                  </button>
                                )}
                              </div>
                            ) : u.course_of_interest ? (
                              <span className="text-slate-600 font-medium block" title={u.course_of_interest}>
                                {u.course_of_interest}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold text-xs flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                Not enrolled
                              </span>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        {u.approved === false ? (
                          <Badge variant="warning" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200 py-0.5">
                            Pending
                          </Badge>
                        ) : (
                          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              disabled={togglingActiveId === u.id || u.is_active !== false}
                              onClick={() => handleSetActive(u.id, true)}
                              title="Set Active"
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-black rounded transition-all select-none",
                                u.is_active !== false
                                  ? "bg-emerald-600 text-white shadow-xs cursor-default"
                                  : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer",
                                togglingActiveId === u.id && "opacity-50 cursor-wait"
                              )}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              disabled={togglingActiveId === u.id || u.is_active === false || u.id === currentUserId}
                              onClick={() => handleSetActive(u.id, false)}
                              title={u.id === currentUserId ? "Cannot deactivate yourself" : "Set Inactive"}
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-black rounded transition-all select-none",
                                u.is_active === false
                                  ? "bg-rose-600 text-white shadow-xs cursor-default"
                                  : "text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer",
                                togglingActiveId === u.id && "opacity-50 cursor-wait",
                                u.id === currentUserId && "opacity-40 cursor-not-allowed"
                              )}
                            >
                              Inactive
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="pr-5 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.approved === false && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={approvingId === u.id}
                              className="h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1 rounded-lg px-2 text-xs font-semibold min-w-[75px]"
                              onClick={() => handleApproveUser(u.id)}
                            >
                              {approvingId === u.id ? (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                </span>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                          {(u.roles?.includes("student") || u.role === "student") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs font-bold text-aims-navy border-blue-200 hover:bg-blue-50 gap-1 rounded-lg px-2"
                              onClick={() => openEnrollModal(u)}
                              title="Assign / Enroll Courses for this Student"
                            >
                              <BookOpen className="h-3 w-3 text-blue-600" />
                              Assign
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                              {(u.roles?.includes("student") || u.role === "student") && (
                                <>
                                  <DropdownMenuItem
                                    className="gap-2 font-bold text-aims-navy focus:bg-blue-50 cursor-pointer"
                                    onClick={() => openStudentDetails(u)}
                                  >
                                    <UserCircle className="h-4 w-4 text-blue-600" />
                                    View Student Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {u.approved === false && (
                                <>
                                  <DropdownMenuItem
                                    disabled={approvingId === u.id}
                                    className="gap-2 font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                    onClick={() => handleApproveUser(u.id)}
                                  >
                                    {approvingId === u.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    )}
                                    Approve Application
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "admin", u.roles)}>
                                <Shield className="h-4 w-4 text-purple-600" />
                                {u.roles?.includes("admin") ? "✓ Admin (Click to Remove)" : "Add Admin Role"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "instructor", u.roles)}>
                                <GraduationCap className="h-4 w-4 text-aims-green" />
                                {u.roles?.includes("instructor") ? "✓ Instructor (Click to Remove)" : "Add Instructor Role"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "accountant", u.roles)}>
                                <DollarSign className="h-4 w-4 text-indigo-600" />
                                {u.roles?.includes("accountant") ? "✓ Accountant (Click to Remove)" : "Add Accountant Role"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "student", u.roles)}>
                                <UserCircle className="h-4 w-4 text-aims-navy" />
                                {u.roles?.includes("student") ? "✓ Student (Click to Remove)" : "Add Student Role"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 font-semibold text-aims-navy focus:bg-blue-50 cursor-pointer" onClick={() => openEnrollModal(u)}>
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                Assign Course (Enroll)
                              </DropdownMenuItem>
                              {(u.roles?.includes("instructor") || u.role === "instructor" || u.roles?.includes("admin") || u.role === "admin") && (
                                <DropdownMenuItem className="gap-2 font-semibold text-emerald-700 focus:bg-emerald-50 cursor-pointer" onClick={() => openStaffModal(u)}>
                                  <UserCheck className="h-4 w-4 text-emerald-600" />
                                  Assign Course to Faculty
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {u.approved !== false && (
                                <>
                                  <DropdownMenuItem
                                    disabled={togglingActiveId === u.id || u.id === currentUserId}
                                    className={cn(
                                      "gap-2 font-semibold cursor-pointer",
                                      u.is_active !== false
                                        ? "text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                        : "text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                    )}
                                    onClick={() => handleToggleActive(u.id, u.is_active !== false)}
                                  >
                                    {u.is_active !== false ? (
                                      <>
                                        <PowerOff className="h-4 w-4 text-rose-600" />
                                        Make User Inactive
                                      </>
                                    ) : (
                                      <>
                                        <Power className="h-4 w-4 text-emerald-600" />
                                        Make User Active
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteUser(u.id)}>
                                <Trash2 className="h-4 w-4" /> Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-2.5 sm:gap-4 p-3 sm:p-5 md:p-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-500 font-semibold py-8 text-xs sm:text-sm">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 font-semibold py-8 text-xs sm:text-sm">No users found.</div>
          ) : (
            filteredUsers.map((u) => (
              <Card key={u.id} className="border-slate-100 overflow-hidden shadow-none hover:shadow-sm">
                <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-2 ring-white shadow-sm">
                        <AvatarImage src={u.avatar_url || ""} />
                        <AvatarFallback className="text-[10px] sm:text-xs font-bold text-white bg-gradient-to-br from-aims-navy to-aims-green">
                          {initials(u.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline(u) && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                          title="Online right now"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <h4
                          onClick={() => openStudentDetails(u)}
                          className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight hover:text-blue-600 hover:underline cursor-pointer"
                          title="Click to view student details"
                        >
                          {u.full_name}
                        </h4>
                        {renderRoleBadges(u)}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium break-all">
                        {u.email}
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {isUserOnline(u) ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online now
                          </span>
                        ) : u.last_seen_at ? (
                          <span className="text-slate-500 font-semibold">
                            Active {formatLastSeen(u.last_seen_at).text}
                          </span>
                        ) : (
                          <span className="text-slate-400">Offline</span>
                        )}
                        {(u.time_spent_today_seconds || 0) > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600 font-semibold">
                              {formatDuration(u.time_spent_today_seconds)} today
                            </span>
                          </>
                        )}
                      </div>
                      {(u.roles?.includes("student") || u.role === "student") && (
                        <p className="text-[10px] font-semibold truncate pt-0.5">
                          {u.enrollments && u.enrollments.length > 0 ? (
                            <span className="text-emerald-700">
                              📚 {u.enrollments.length} Course{u.enrollments.length > 1 ? "s" : ""}: {u.enrollments.map((e: any) => e.course?.title).filter(Boolean).join(", ")}
                            </span>
                          ) : (
                            <span className="text-amber-600">⚠️ No courses enrolled</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {u.approved === false ? (
                      <Badge variant="warning" className="text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                        Pending Approval
                      </Badge>
                    ) : (
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={togglingActiveId === u.id || u.is_active !== false}
                          onClick={() => handleSetActive(u.id, true)}
                          title="Set Active"
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-black rounded transition-all select-none",
                            u.is_active !== false
                              ? "bg-emerald-600 text-white shadow-xs cursor-default"
                              : "text-slate-600 active:bg-emerald-50 cursor-pointer",
                            togglingActiveId === u.id && "opacity-50 cursor-wait"
                          )}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          disabled={togglingActiveId === u.id || u.is_active === false || u.id === currentUserId}
                          onClick={() => handleSetActive(u.id, false)}
                          title="Set Inactive"
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-black rounded transition-all select-none",
                            u.is_active === false
                              ? "bg-rose-600 text-white shadow-xs cursor-default"
                              : "text-slate-600 active:bg-rose-50 cursor-pointer",
                            togglingActiveId === u.id && "opacity-50 cursor-wait",
                            u.id === currentUserId && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          Inactive
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {u.approved === false && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={approvingId === u.id}
                          className="h-7 sm:h-8 text-[11px] sm:text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1 rounded-lg px-2 sm:px-2.5 font-semibold min-w-[75px]"
                          onClick={() => handleApproveUser(u.id)}
                        >
                          {approvingId === u.id ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Approving...
                            </span>
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      )}
                      {(u.roles?.includes("student") || u.role === "student") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold text-aims-navy border-blue-200 hover:bg-blue-50 gap-1 rounded-lg px-2 sm:px-2.5"
                          onClick={() => openEnrollModal(u)}
                          title="Assign Course"
                        >
                          <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                          Assign
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                          {(u.roles?.includes("student") || u.role === "student") && (
                            <>
                              <DropdownMenuItem
                                className="gap-2 font-bold text-aims-navy focus:bg-blue-50 cursor-pointer"
                                onClick={() => openStudentDetails(u)}
                              >
                                <UserCircle className="h-4 w-4 text-blue-600" />
                                View Student Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {u.approved === false && (
                            <>
                              <DropdownMenuItem
                                disabled={approvingId === u.id}
                                className="gap-2 font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                onClick={() => handleApproveUser(u.id)}
                              >
                                {approvingId === u.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                )}
                                Approve Application
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "admin", u.roles)}>
                            <Shield className="h-4 w-4 text-purple-600" />
                            {u.roles?.includes("admin") ? "✓ Admin (Click to Remove)" : "Add Admin Role"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "instructor", u.roles)}>
                            <GraduationCap className="h-4 w-4 text-aims-green" />
                            {u.roles?.includes("instructor") ? "✓ Instructor (Click to Remove)" : "Add Instructor Role"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "accountant", u.roles)}>
                            <DollarSign className="h-4 w-4 text-indigo-600" />
                            {u.roles?.includes("accountant") ? "✓ Accountant (Click to Remove)" : "Add Accountant Role"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "student", u.roles)}>
                            <UserCircle className="h-4 w-4 text-aims-navy" />
                            {u.roles?.includes("student") ? "✓ Student (Click to Remove)" : "Add Student Role"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 font-semibold text-aims-navy focus:bg-blue-50 cursor-pointer" onClick={() => openEnrollModal(u)}>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Assign Course (Enroll)
                          </DropdownMenuItem>
                          {(u.roles?.includes("instructor") || u.role === "instructor" || u.roles?.includes("admin") || u.role === "admin") && (
                            <DropdownMenuItem className="gap-2 font-semibold text-emerald-700 focus:bg-emerald-50 cursor-pointer" onClick={() => openStaffModal(u)}>
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                              Assign Course to Faculty
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {u.approved !== false && (
                            <>
                              <DropdownMenuItem
                                disabled={togglingActiveId === u.id || u.id === currentUserId}
                                className={cn(
                                  "gap-2 font-semibold cursor-pointer",
                                  u.is_active !== false
                                    ? "text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                    : "text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                )}
                                onClick={() => handleToggleActive(u.id, u.is_active !== false)}
                              >
                                {u.is_active !== false ? (
                                  <>
                                    <PowerOff className="h-4 w-4 text-rose-600" />
                                    Make User Inactive
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 text-emerald-600" />
                                    Make User Active
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" /> Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Student Course Enrollment Dialog */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Course Enrollment & Assignments
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Enroll <span className="text-slate-900 font-bold">{selectedStudent?.full_name}</span> into courses or manage current enrollments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            {/* Enroll in new course */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-3">
              <Label className="font-bold text-xs sm:text-sm text-slate-800">Enroll into Course</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCourseToEnroll} onValueChange={setSelectedCourseToEnroll}>
                  <SelectTrigger className="flex-1 h-10 rounded-xl bg-white border-slate-200 font-semibold text-xs sm:text-sm">
                    <SelectValue placeholder="Select course..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id} className="text-xs sm:text-sm font-semibold">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleEnrollStudent}
                  disabled={enrollingStudent || !selectedCourseToEnroll}
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm gap-1.5 shrink-0"
                >
                  {enrollingStudent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Student"
                  )}
                </Button>
              </div>
            </div>

            {/* Currently enrolled courses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">Currently Enrolled Courses</h4>
                <Badge variant="outline" className="text-xs font-bold">
                  {studentEnrollments.length} Active
                </Badge>
              </div>

              {loadingEnrollments ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Loading student enrollments...
                </div>
              ) : studentEnrollments.length === 0 ? (
                <div className="py-6 text-center text-xs sm:text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-semibold">
                  This student is not enrolled in any course yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {studentEnrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {enr.course?.title || "Course"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Enrolled: {enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString("en-IN") : "—"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={unenrollingId === enr.id}
                        onClick={() => handleUnenrollStudent(enr.id)}
                        className="h-8 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-lg px-2.5 shrink-0"
                      >
                        {unenrollingId === enr.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Unenroll"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollModalOpen(false)} className="rounded-xl font-semibold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Course Lead Assignment Dialog */}
      <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Assign Faculty to Courses
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Designate <span className="text-slate-900 font-bold">{selectedStaff?.full_name}</span> as the lead instructor for courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            {/* Assign a course */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
              <Label className="font-bold text-xs sm:text-sm text-slate-800">Assign Course to this Faculty</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCourseToAssign} onValueChange={setSelectedCourseToAssign}>
                  <SelectTrigger className="flex-1 h-10 rounded-xl bg-white border-slate-200 font-semibold text-xs sm:text-sm">
                    <SelectValue placeholder="Choose course..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id} className="text-xs sm:text-sm font-semibold">
                        {course.title}
                        {course.instructor?.full_name ? ` (Lead: ${course.instructor.full_name})` : " (Unassigned)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleAssignFaculty(selectedCourseToAssign, selectedStaff?.id)}
                  disabled={assigningStaff || !selectedCourseToAssign}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm gap-1.5 shrink-0"
                >
                  {assigningStaff ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Lead Faculty"
                  )}
                </Button>
              </div>
            </div>

            {/* Currently assigned courses for this staff */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">Currently Taught Courses</h4>
                <Badge variant="outline" className="text-xs font-bold">
                  {courses.filter((c) => c.instructor_id === selectedStaff?.id).length} Courses
                </Badge>
              </div>

              {courses.filter((c) => c.instructor_id === selectedStaff?.id).length === 0 ? (
                <div className="py-6 text-center text-xs sm:text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-semibold">
                  No courses are currently assigned to this faculty member.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {courses
                    .filter((c) => c.instructor_id === selectedStaff?.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {c.description ? c.description.slice(0, 60) + "..." : "No description"}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={assigningStaff}
                          onClick={() => handleAssignFaculty(c.id, null)}
                          className="h-8 text-xs font-bold text-amber-700 border-amber-200 hover:bg-amber-50 rounded-lg px-2.5 shrink-0"
                        >
                          Unassign
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffModalOpen(false)} className="rounded-xl font-semibold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Basic Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden rounded-2xl sm:rounded-3xl border-slate-200 shadow-2xl">
          <div className="bg-gradient-to-r from-aims-navy via-slate-900 to-blue-900 p-5 text-white">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 ring-2 ring-white/30 shadow-md shrink-0">
                <AvatarImage src={selectedStudentForDetails?.avatar_url || ""} />
                <AvatarFallback className="bg-amber-400 text-slate-950 font-black text-sm">
                  {initials(selectedStudentForDetails?.full_name || "ST")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-black text-white truncate">
                  {selectedStudentForDetails?.full_name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-bold bg-white/10 text-white border-white/20">
                    Student
                  </Badge>
                  {selectedStudentForDetails?.is_active !== false ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Inactive
                    </span>
                  )}
                  {isUserOnline(selectedStudentForDetails) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-medium">
                      Seen {formatLastSeen(selectedStudentForDetails?.last_seen_at).text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Full Name */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                  <UserCircle className="h-3 w-3 text-aims-navy" /> Name
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {selectedStudentForDetails?.full_name || "—"}
                </div>
              </div>

              {/* Mobile Number */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                  <Phone className="h-3 w-3 text-emerald-600" /> Mobile Number
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {selectedStudentForDetails?.whatsapp || "Not provided"}
                </div>
              </div>

              {/* Email ID */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                  <Mail className="h-3 w-3 text-blue-600" /> Email ID
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {selectedStudentForDetails?.email || "—"}
                </div>
              </div>

              {/* Joined Date */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3 text-slate-500" /> Joined Date
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedStudentForDetails?.created_at
                    ? new Date(selectedStudentForDetails.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
            </div>

            {/* What Course He/She Enrolled */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Enrolled Course(s)
              </div>
              {selectedStudentForDetails?.enrollments && selectedStudentForDetails.enrollments.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedStudentForDetails.enrollments.map((enr: any, idx: number) => (
                    <div
                      key={enr.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {enr.course?.title || selectedStudentForDetails.course_of_interest || "Course"}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold bg-white text-emerald-700 border-emerald-200 shrink-0">
                        Enrolled
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : selectedStudentForDetails?.course_of_interest ? (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {selectedStudentForDetails.course_of_interest}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold shrink-0">(Course of Interest)</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  Not enrolled in any course yet.
                </div>
              )}
            </div>

            {/* Student Activity & Study Time */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" /> Study Time & Engagement
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isUserOnline(selectedStudentForDetails)
                    ? "🟢 Currently Active"
                    : selectedStudentForDetails?.last_seen_at
                    ? `Last active: ${new Date(selectedStudentForDetails.last_seen_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`
                    : "Never active"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center justify-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-blue-600" /> Today
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    {formatDuration(selectedStudentForDetails?.time_spent_today_seconds)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-center gap-1">
                    <Calendar className="h-2.5 w-2.5 text-purple-600" /> This Month
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    {formatDuration(selectedStudentForDetails?.time_spent_month_seconds)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-center gap-1">
                    <Activity className="h-2.5 w-2.5 text-emerald-600" /> All-Time
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    {formatDuration(selectedStudentForDetails?.total_time_spent_seconds)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl font-bold text-xs gap-1.5"
                onClick={() => {
                  setDetailsModalOpen(false);
                  openEnrollModal(selectedStudentForDetails);
                }}
              >
                <BookOpen className="h-3.5 w-3.5" /> Assign Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
