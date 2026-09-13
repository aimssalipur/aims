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
  CheckCircle2,
  DollarSign,
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
import { initials } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!form.fullName || !form.email || !form.password) {
      toast({
        title: "Missing details",
        description: "Please enter a name, email, and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to create user",
          description: data.error,
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
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to delete user",
          description: data.error,
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
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleToggleRole = async (userId: string, targetRole: string, currentRoles: string[]) => {
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

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, roles: newRoles }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to update roles",
          description: data.error,
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
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, approved: true }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to approve user",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "User approved ✅",
          description: "Student application has been approved and account activated.",
          variant: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const renderRoleBadges = (u: any) => {
    const userRoles = u.roles || [u.role];
    return (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
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
            <Badge key={role} variant="default" className="text-[10px] font-bold px-2 py-0.5">
              <UserCircle className="h-2.5 w-2.5 mr-1 shrink-0" />
              Student
            </Badge>
          );
        })}
      </div>
    );
  };

  const totalStudents = users.filter((u) => (u.roles?.includes("student") || u.role === "student") && u.approved !== false).length;
  const totalFaculty = users.filter((u) => u.roles?.includes("instructor") || u.role === "instructor").length;
  const totalAdmins = users.filter((u) => u.roles?.includes("admin") || u.role === "admin").length;
  const totalPending = users.filter((u) => u.approved === false).length;

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
      (activeTab === "admins" && (u.roles?.includes("admin") || u.role === "admin")) ||
      (activeTab === "instructors" && (u.roles?.includes("instructor") || u.role === "instructor")) ||
      (activeTab === "accountants" && (u.roles?.includes("accountant") || u.role === "accountant")) ||
      (activeTab === "students" && (u.roles?.includes("student") || u.role === "student") && u.approved !== false) ||
      (activeTab === "pending" && u.approved === false);

    return matchesSearch && matchesRole && matchesTab;
  });

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management 👥
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Manage students, faculty, and admin accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="lg" className="gap-2 h-11 shadow-lg shadow-amber-600/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0">
                <UserPlus className="h-4.5 w-4.5" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold">Add New User</DialogTitle>
                <DialogDescription>
                  Create a new account and assign a role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 py-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="e.g. Priyanka Mishra"
                    className="h-11"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="name@aims.edu"
                    className="h-11"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    className="h-11"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) => setForm({ ...form, role: val })}
                  >
                    <SelectTrigger className="h-11">
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
                <div className="space-y-2 sm:col-span-2">
                  <Label>Temporary Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreateUser}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="group overflow-hidden border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-2xl ${s.ring} ${s.col} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                      {s.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-100 overflow-hidden">
        <CardHeader className="p-5 md:p-6 border-b border-slate-100 flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              {["all", "students", "pending", "instructors", "accountants", "admins"].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="capitalize h-10 px-4 rounded-xl text-xs md:text-sm font-bold data-[state=active]:bg-aims-navy data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100 transition-all"
                >
                  {t === "all" && "All Users"}
                  {t === "students" && "Students"}
                  {t === "pending" && `Pending Applications (${totalPending}) ⏳`}
                  {t === "instructors" && "Instructors"}
                  {t === "accountants" && "Accountants"}
                  {t === "admins" && "Admins"}
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
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Course / Department</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <TableRow key={u.id} className="group/row hover:bg-slate-50/80">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 ring-2 ring-white shadow-md">
                            <AvatarImage src={u.avatar_url || ""} />
                            <AvatarFallback
                              className={`text-xs font-bold text-white bg-gradient-to-br ${
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
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 leading-tight">
                              {u.full_name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[220px]">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderRoleBadges(u)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">
                          {(u.roles?.includes("admin") || u.role === "admin") && "Management & Operations"}
                          {(u.roles?.includes("instructor") || u.role === "instructor") && !u.roles?.includes("admin") && (u.course_of_interest || "Medical Department")}
                          {(u.roles?.includes("student") || u.role === "student") && !u.roles?.includes("instructor") && !u.roles?.includes("admin") && (u.course_of_interest || "—")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.approved === false ? (
                          <Badge variant="warning" className="text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                            Pending Approval
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[11px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {u.approved === false && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-emerald-200 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-1 rounded-lg px-3 font-semibold"
                              onClick={() => handleApproveUser(u.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg opacity-50 group-hover/row:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4.5 w-4.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                              {u.approved === false && (
                                <>
                                  <DropdownMenuItem className="gap-2 font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleApproveUser(u.id)}>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approve Application
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
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "student", u.roles)}>
                                <UserCircle className="h-4 w-4 text-aims-navy" />
                                {u.roles?.includes("student") ? "✓ Student (Click to Remove)" : "Add Student Role"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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
        <div className="lg:hidden grid sm:grid-cols-2 gap-4 p-5 md:p-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-500 font-semibold">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 font-semibold">No users found.</div>
          ) : (
            filteredUsers.map((u) => (
              <Card key={u.id} className="border-slate-100 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                      <AvatarImage src={u.avatar_url || ""} />
                      <AvatarFallback className="text-xs font-bold text-white bg-gradient-to-br from-aims-navy to-aims-green">
                        {initials(u.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 truncate leading-tight">
                          {u.full_name}
                        </h4>
                        {renderRoleBadges(u)}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {u.approved === false ? (
                      <Badge variant="warning" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                        Pending Approval
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px] font-bold">Active</Badge>
                    )}
                    <div className="flex items-center gap-1.5">
                      {u.approved === false && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1 rounded-lg px-2.5 font-semibold"
                          onClick={() => handleApproveUser(u.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                          {u.approved === false && (
                            <>
                              <DropdownMenuItem className="gap-2 font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleApproveUser(u.id)}>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleRole(u.id, "student", u.roles)}>
                            <UserCircle className="h-4 w-4 text-aims-navy" />
                            {u.roles?.includes("student") ? "✓ Student (Click to Remove)" : "Add Student Role"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
    </div>
  );
}
