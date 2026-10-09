"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Send,
  Loader2,
  RotateCw,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";
import { subscribeToDataRefresh } from "@/lib/refresh-event";
import { cn } from "@/lib/utils";
import { ReceiptModal, ReceiptData } from "@/components/finance/receipt-modal";

export default function AccountantFeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logOpen, setLogOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Edit Fee Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    studentName: "",
    studentEmail: "",
    course_id: "",
    amount_paid: "",
    payment_method: "Cash",
    transaction_id: "",
    payment_date: "",
    roll_no: "",
    guardian_name: "",
    address: "",
    status: "verified",
    remarks: "",
  });
  const [updatingFee, setUpdatingFee] = useState(false);

  // Delete Fee State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<any>(null);
  const [deletingFee, setDeletingFee] = useState(false);

  // Search inside Log Fee Modal
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [form, setForm] = useState({
    student_id: "",
    course_id: "",
    amount_paid: "",
    payment_method: "Cash",
    transaction_id: "",
    remarks: "",
    status: "verified", // Manual logging by accountant is pre-verified
    payment_date: new Date().toISOString().slice(0, 16),
    roll_no: "",
    guardian_name: "",
    address: "",
  });

  const fetchFees = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      const response = await fetch(`/api/accountant/fees?${queryParams.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setFees(data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching fees",
        description: "Failed to connect to the fee records database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/accountant/students");
      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchFees();
      fetchStudents();
    });
  }, [statusFilter]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([fetchFees(), fetchStudents(), fetchCourses()]);
      toast({
        title: "Fees Ledger Updated ✅",
        description: "Latest student fee submissions loaded.",
        variant: "success",
      });
    } catch {}
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("log") === "true") {
        setLogOpen(true);
      }
    }
  }, []);

  const handleOpenFeeReceipt = (fee: any) => {
    const cleanId = fee.id ? fee.id.replace(/-/g, "").slice(0, 8).toUpperCase() : String(Math.floor(100000 + Math.random() * 900000));
    const receiptNo = `AIMS-FEE-${cleanId}`;

    const studentName = fee.student?.full_name || "AIMS Enrolled Student";
    const studentEmail = fee.student?.email;
    const studentPhone = fee.student?.whatsapp;
    const course = fee.course?.title || fee.student?.course_of_interest || "AIMS Nursing & Medical Coaching";

    // Extract student particulars from remarks if present
    let studentRollNo = "";
    let guardianName = "";
    let studentAddress = "";
    let cleanDescription = fee.remarks || "";

    if (fee.remarks) {
      const rollMatch = fee.remarks.match(/Roll:\s*([^|]+)/i);
      if (rollMatch) studentRollNo = rollMatch[1].trim();

      const guardianMatch = fee.remarks.match(/Guardian:\s*([^|]+)/i);
      if (guardianMatch) guardianName = guardianMatch[1].trim();

      const addressMatch = fee.remarks.match(/Address:\s*([^|]+)/i);
      if (addressMatch) studentAddress = addressMatch[1].trim();

      const noteMatch = fee.remarks.match(/Note:\s*(.+)$/i);
      if (noteMatch) {
        cleanDescription = noteMatch[1].trim();
      } else if (studentRollNo || guardianName || studentAddress) {
        cleanDescription = "";
      }
    }

    const data: ReceiptData = {
      receiptNo,
      date: fee.payment_date || fee.created_at || new Date(),
      type: "fee",
      title: "Official Student Fee Receipt",
      partyName: studentName,
      partyRoleOrCourse: course,
      partyContact: [studentEmail, studentPhone].filter(Boolean).join(" · ") || undefined,
      studentRollNo: studentRollNo || undefined,
      guardianName: guardianName || undefined,
      studentAddress: studentAddress || undefined,
      category: "Academic Course Tuition & Fees",
      amount: Number(fee.amount_paid) || 0,
      paymentMethod: fee.payment_method || "UPI Online",
      referenceNo: fee.transaction_id || undefined,
      description: cleanDescription ? `Course Fee: ${cleanDescription}` : `Tuition fee payment received for ${course}`,
      recordedBy: fee.verifier?.full_name || "AIMS Admissions & Accounts",
      verifiedBy: fee.verifier?.full_name || "AIMS Accounts Dept",
      status: fee.status === "verified" ? "Verified & Settled" : (fee.status === "rejected" ? "Payment Rejected" : "Pending Verification"),
    };

    setReceiptData(data);
    setReceiptOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    let rollNo = "";
    let guardianName = "";
    let address = "";
    let note = fee.remarks || "";

    if (fee.remarks) {
      const rollMatch = fee.remarks.match(/Roll:\s*([^|]+)/i);
      const guardianMatch = fee.remarks.match(/Guardian:\s*([^|]+)/i);
      const addressMatch = fee.remarks.match(/Address:\s*([^|]+)/i);
      if (rollMatch) rollNo = rollMatch[1].trim();
      if (guardianMatch) guardianName = guardianMatch[1].trim();
      if (addressMatch) address = addressMatch[1].trim();

      const noteMatch = fee.remarks.match(/Note:\s*(.+)$/i);
      if (noteMatch) {
        note = noteMatch[1].trim();
      } else if (rollNo || guardianName || address) {
        note = "";
      }
    }

    const dateStr = fee.payment_date
      ? new Date(fee.payment_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    setEditForm({
      id: fee.id,
      studentName: fee.student?.full_name || "Enrolled Student",
      studentEmail: fee.student?.email || "",
      course_id: fee.course_id || "",
      amount_paid: String(fee.amount_paid ?? ""),
      payment_method: fee.payment_method || "Cash",
      transaction_id: fee.transaction_id || "",
      payment_date: dateStr,
      roll_no: rollNo,
      guardian_name: guardianName,
      address: address,
      status: fee.status || "verified",
      remarks: note,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (updatingFee) return;

    if (!editForm.amount_paid || Number(editForm.amount_paid) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid fee payment amount.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingFee(true);
    try {
      const detailsParts = [];
      if (editForm.roll_no?.trim()) detailsParts.push(`Roll: ${editForm.roll_no.trim()}`);
      if (editForm.guardian_name?.trim()) detailsParts.push(`Guardian: ${editForm.guardian_name.trim()}`);
      if (editForm.address?.trim()) detailsParts.push(`Address: ${editForm.address.trim()}`);
      if (editForm.remarks?.trim()) detailsParts.push(`Note: ${editForm.remarks.trim()}`);
      const combinedRemarks = detailsParts.join(" | ");

      const payload = {
        id: editForm.id,
        course_id: editForm.course_id || null,
        amount_paid: Number(editForm.amount_paid),
        payment_method: editForm.payment_method,
        transaction_id: editForm.transaction_id || null,
        remarks: combinedRemarks,
        payment_date: editForm.payment_date ? new Date(editForm.payment_date).toISOString() : undefined,
        status: editForm.status,
      };

      const response = await fetch("/api/accountant/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        toast({
          title: "Failed to update record",
          description: getFriendlyErrorMessage(data.error || "Unable to save changes."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fee Record Updated ✅",
          description: "Payment details and ledger have been successfully updated.",
          variant: "success",
        });
        setEditOpen(false);
        fetchFees();
      }
    } catch (err: any) {
      toast({
        title: "Error updating",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setUpdatingFee(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!feeToDelete || deletingFee) return;

    setDeletingFee(true);
    try {
      const response = await fetch(`/api/accountant/fees?id=${feeToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        toast({
          title: "Delete failed",
          description: getFriendlyErrorMessage(data.error || "Unable to delete fee record."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fee Record Deleted 🗑️",
          description: data.message || "Fee entry has been removed from ledger.",
          variant: "success",
        });
        setDeleteOpen(false);
        setFeeToDelete(null);
        fetchFees();
      }
    } catch (err: any) {
      toast({
        title: "Error deleting",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeletingFee(false);
    }
  };

  const handleVerify = async (id: string) => {
    if (verifyingId) return;

    setVerifyingId(id);
    try {
      const response = await fetch("/api/accountant/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "verified" }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Verification failed",
          description: getFriendlyErrorMessage(data.error || "Unable to verify payment at this time."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment verified ✅",
          description: "Student payment request approved and transaction posted.",
          variant: "success",
        });
        fetchFees();
      }
    } catch (err: any) {
      toast({
        title: "Error verifying",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectionReason("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (rejecting) return;

    if (!rejectionReason) {
      toast({
        title: "Remarks required",
        description: "Please explain the reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setRejecting(true);
    try {
      const response = await fetch("/api/accountant/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectId, status: "rejected", remarks: rejectionReason }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Rejection failed",
          description: getFriendlyErrorMessage(data.error || "Unable to reject submission at this time."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment rejected ❌",
          description: "Student payment request has been marked as rejected.",
          variant: "success",
        });
        setRejectOpen(false);
        fetchFees();
      }
    } catch (err: any) {
      toast({
        title: "Error rejecting",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleManualLog = async () => {
    if (submitting) return;

    if (!form.student_id || !form.amount_paid || !form.payment_method) {
      toast({
        title: "Missing fields",
        description: "Please select a student, amount, and payment method.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Package student details into remarks for archival and receipt rendering
      const detailsParts = [];
      if (form.roll_no?.trim()) detailsParts.push(`Roll: ${form.roll_no.trim()}`);
      if (form.guardian_name?.trim()) detailsParts.push(`Guardian: ${form.guardian_name.trim()}`);
      if (form.address?.trim()) detailsParts.push(`Address: ${form.address.trim()}`);
      if (form.remarks?.trim()) detailsParts.push(`Note: ${form.remarks.trim()}`);
      const combinedRemarks = detailsParts.join(" | ");

      const payload = {
        ...form,
        remarks: combinedRemarks,
        payment_date: form.payment_date ? new Date(form.payment_date).toISOString() : new Date().toISOString(),
      };

      const response = await fetch("/api/accountant/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to record payment",
          description: getFriendlyErrorMessage(data.error || "Unable to record payment at this time."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment recorded ✅",
          description: "Student fee payment logged. Opening official receipt...",
          variant: "success",
        });
        setLogOpen(false);
        fetchFees();
        setForm({
          student_id: "",
          course_id: "",
          amount_paid: "",
          payment_method: "Cash",
          transaction_id: "",
          remarks: "",
          status: "verified",
          payment_date: new Date().toISOString().slice(0, 16),
          roll_no: "",
          guardian_name: "",
          address: "",
        });
        setStudentSearchTerm("");
        // Automatically pop up the official bill receipt!
        handleOpenFeeReceipt(data);
      }
    } catch (err: any) {
      toast({
        title: "Error logging payment",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredStudentsForPicker = students.filter((s) => {
    if (!studentSearchTerm.trim()) return true;
    const term = studentSearchTerm.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.whatsapp || "").toLowerCase().includes(term) ||
      (s.course_of_interest || "").toLowerCase().includes(term)
    );
  });

  const selectedStudentObj = students.find((s) => s.id === form.student_id);

  const filteredFees = fees.filter((fee) => {
    const studentName = fee.student?.full_name?.toLowerCase() || "";
    const studentEmail = fee.student?.email?.toLowerCase() || "";
    const courseTitle = (fee.course?.title || fee.student?.course_of_interest || "").toLowerCase();
    const refNo = fee.transaction_id?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return (
      studentName.includes(term) ||
      studentEmail.includes(term) ||
      courseTitle.includes(term) ||
      refNo.includes(term)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Student Fees Verification 🎓
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-semibold">
            Approve online fee payments, verify deposit receipts, and log office cash payments.
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
            title="Refresh Fees Ledger (without page reload)"
          >
            <RotateCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-0 font-bold rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Record Cash/Office Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                  Record Course Fee & Bill
                </DialogTitle>
                <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
                  Search student, assign course fee, and generate their official bill receipt.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 sm:space-y-4 py-2 sm:py-3">
                {/* Searchable Student Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-xs sm:text-sm">
                      Select Student <span className="text-rose-500">*</span>
                    </Label>
                    {form.student_id && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, student_id: "", course_id: "" });
                          setStudentSearchTerm("");
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        Change Student
                      </button>
                    )}
                  </div>

                  {form.student_id && selectedStudentObj ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-slate-900 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="truncate">{selectedStudentObj.full_name}</span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              <span>{selectedStudentObj.email}</span>
                              {selectedStudentObj.whatsapp && <span>• {selectedStudentObj.whatsapp}</span>}
                            </div>
                          </div>
                          <Badge className="bg-indigo-600 text-white text-[10px] shrink-0 font-bold">
                            Selected
                          </Badge>
                        </div>

                        {/* Editable Student Particulars for Ethical & Complete Bill */}
                        <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                            <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                              Student Particulars (Printed on Bill)
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              Official Voucher
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[11px] font-bold text-slate-700">Roll / Reg Number</Label>
                              <Input
                                value={form.roll_no}
                                onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                                placeholder="e.g. AIMS-2026-N042"
                                className="h-9 text-xs rounded-xl font-mono mt-0.5 bg-white border-slate-200"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold text-slate-700">Father / Guardian Name</Label>
                              <Input
                                value={form.guardian_name}
                                onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                                placeholder="Guardian's name"
                                className="h-9 text-xs rounded-xl mt-0.5 bg-white border-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Label className="text-[11px] font-bold text-slate-700">Student Address / City</Label>
                              <Input
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="e.g. Salipur, Cuttack / Bhubaneswar"
                                className="h-9 text-xs rounded-xl mt-0.5 bg-white border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            placeholder="Type student name, phone, or email..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="pl-8 h-10 text-xs sm:text-sm rounded-xl font-medium"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-xs">
                          {filteredStudentsForPicker.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400 font-medium">
                              No students found matching &quot;{studentSearchTerm}&quot;
                            </div>
                          ) : (
                            filteredStudentsForPicker.map((stud) => (
                              <button
                                type="button"
                                key={stud.id}
                                onClick={() => {
                                  let matchedCourseId = "";
                                  if (stud.course_of_interest) {
                                    const match = courses.find(
                                      (c) => c.title.toLowerCase() === stud.course_of_interest.toLowerCase()
                                    );
                                    if (match) matchedCourseId = match.id;
                                  }
                                  setForm({
                                    ...form,
                                    student_id: stud.id,
                                    course_id: matchedCourseId,
                                    roll_no: form.roll_no || `AIMS-2026-${stud.id.slice(0, 5).toUpperCase()}`,
                                  });
                                }}
                                className="w-full text-left p-2.5 hover:bg-indigo-50/60 transition-colors flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {stud.full_name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {stud.email} {stud.whatsapp ? `• ${stud.whatsapp}` : ""}
                                  </div>
                                </div>
                                {stud.course_of_interest && (
                                  <Badge variant="outline" className="text-[9px] text-slate-600 bg-slate-50 shrink-0 font-normal">
                                    {stud.course_of_interest}
                                  </Badge>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Course Select */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs sm:text-sm">Course / Academic Program</Label>
                    <Select
                      value={form.course_id}
                      onValueChange={(val) => setForm({ ...form, course_id: val })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                        <SelectValue placeholder="Select course..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bill Date & Time */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-xs sm:text-sm">Bill Date & Time <span className="text-rose-500">*</span></Label>
                      <span className="text-[10px] text-slate-500 font-medium">Recorded on official voucher</span>
                    </div>
                    <Input
                      type="datetime-local"
                      className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                      value={form.payment_date}
                      onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                    />
                  </div>

                {/* Amount Paid & Payment Method - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Amount Paid */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-semibold text-xs sm:text-sm">Amount Paid (₹) <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <Input
                        type="number"
                        placeholder="e.g. 15000"
                        className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                        value={form.amount_paid}
                        onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-semibold text-xs sm:text-sm">Payment Method <span className="text-rose-500">*</span></Label>
                    <Select
                      value={form.payment_method}
                      onValueChange={(val) => setForm({ ...form, payment_method: val })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash Deposit</SelectItem>
                        <SelectItem value="UPI">UPI Transfer</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Wire Transfer</SelectItem>
                        <SelectItem value="Card">Debit/Credit Card</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trans Reference */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">Transaction ID / Reference (Optional)</Label>
                  <Input
                    placeholder="e.g. UPI-98273618 / CASH-082"
                    className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                    value={form.transaction_id}
                    onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">Remarks</Label>
                  <Input
                    placeholder="e.g. Installment 1 / Full Semester Fee"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setLogOpen(false)}
                  className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualLog}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-indigo-600/20"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording...
                    </span>
                  ) : (
                    "Log Payment"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Panel Content */}
      <Card className="border-slate-100 overflow-hidden bg-white">
        <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-slate-100 flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="md:max-w-md flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student, email, reference ID..."
                className="pl-10 h-10 sm:h-12 text-xs sm:text-sm font-semibold rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 sm:h-11 w-full sm:w-48 rounded-xl gap-1.5 text-xs sm:text-sm font-semibold">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="verified">Verified Approved</SelectItem>
                <SelectItem value="rejected">Rejected Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Payments Ledger Table */}
        <div className="p-0">
          {loading ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              Loading student payments logs...
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm">No student fee logs found matching requirements.</div>
          ) : (
            <>
              {/* Mobile View: Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredFees.map((fee: any) => (
                  <div key={fee.id} className="p-3.5 sm:p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {new Date(fee.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div>
                        {fee.status === "pending" && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 px-2 py-0.5 text-[10px] rounded-full">
                            <Clock className="h-2.5 w-2.5" /> Pending
                          </Badge>
                        )}
                        {fee.status === "verified" && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 px-2 py-0.5 text-[10px] rounded-full">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        )}
                        {fee.status === "rejected" && (
                          <Badge className="bg-rose-100 text-rose-700 border-rose-200 gap-1 px-2 py-0.5 text-[10px] rounded-full">
                            <XCircle className="h-2.5 w-2.5" /> Rejected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm">{fee.student?.full_name || "N/A"}</div>
                        <div className="text-xs text-slate-400 truncate">{fee.student?.email}</div>
                        <div className="text-xs text-indigo-700 font-medium mt-0.5">
                          {fee.course?.title || fee.student?.course_of_interest || "AIMS Coaching Program"}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-slate-950">{formatCurrency(fee.amount_paid)}</div>
                        <div className="text-[11px] font-semibold text-slate-500">{fee.payment_method}</div>
                        {fee.transaction_id && (
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">{fee.transaction_id}</div>
                        )}
                      </div>
                    </div>

                    {fee.remarks && (
                      <div className="text-xs bg-slate-50 p-2 rounded-lg text-slate-600 italic">
                        "{fee.remarks}"
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="text-slate-400 truncate">
                        {fee.verifier?.full_name ? (
                          <>By <span className="font-semibold text-slate-600">{fee.verifier.full_name}</span></>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {fee.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              disabled={verifyingId === fee.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 font-bold px-2.5 text-xs"
                              onClick={() => handleVerify(fee.id)}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={verifyingId === fee.id}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg h-7 font-bold px-2 text-xs"
                              onClick={() => openRejectDialog(fee.id)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}

                        {fee.status === "verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenFeeReceipt(fee)}
                            className="h-7 px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-xs gap-1 rounded-lg"
                          >
                            <Printer className="h-3 w-3 text-indigo-600" />
                            <span>Receipt</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(fee)}
                          className="h-7 px-2 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-xs gap-1 rounded-lg"
                          title="Edit Fee Payment Details"
                        >
                          <Pencil className="h-3 w-3 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFeeToDelete(fee);
                            setDeleteOpen(true);
                          }}
                          className="h-7 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold text-xs gap-1 rounded-lg"
                          title="Delete Fee Record"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Ledger Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[660px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] sm:text-[10px] font-bold tracking-wider bg-slate-50/50">
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6">Date</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6">Student</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6">Course / Prog</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6">Method / Reference</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6 text-right">Amount</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">Status</th>
                      <th className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                    {filteredFees.map((fee: any) => (
                      <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6 font-medium text-slate-500 whitespace-nowrap">
                          {new Date(fee.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6">
                          <div className="text-slate-900 font-bold text-xs sm:text-sm">{fee.student?.full_name || "N/A"}</div>
                          <div className="text-slate-400 text-[10px] sm:text-xs font-medium">{fee.student?.email || ""}</div>
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-slate-500 font-normal">
                          {fee.student?.course_of_interest || "AIMS Professional Program"}
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{fee.payment_method}</span>
                            <span className="font-mono text-slate-400 text-[10px] sm:text-xs">{fee.transaction_id || "No Tx ID"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-right font-extrabold text-slate-950 text-xs sm:text-base whitespace-nowrap">
                          {formatCurrency(fee.amount_paid)}
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            {fee.status === "pending" && (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-full">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Pending
                              </Badge>
                            )}
                            {fee.status === "verified" && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-full">
                                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Verified
                              </Badge>
                            )}
                            {fee.status === "rejected" && (
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200 gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-full">
                                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Rejected
                              </Badge>
                            )}
                            {fee.remarks && (
                              <span className="text-[9px] sm:text-[10px] text-slate-400 max-w-[130px] truncate block" title={fee.remarks}>
                                "{fee.remarks}"
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">
                          {fee.status === "pending" ? (
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                              <Button
                                size="sm"
                                disabled={verifyingId === fee.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 sm:h-8 font-bold px-2 sm:px-3 text-[11px] sm:text-xs min-w-[65px]"
                                onClick={() => handleVerify(fee.id)}
                              >
                                {verifyingId === fee.id ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    ...
                                  </span>
                                ) : (
                                  "Verify"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={verifyingId === fee.id}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg h-7 sm:h-8 font-bold px-2 sm:px-2.5 text-[11px] sm:text-xs"
                                onClick={() => openRejectDialog(fee.id)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(fee)}
                                className="h-7 sm:h-8 px-2 sm:px-2 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-semibold text-xs gap-1 rounded-lg"
                                title="Edit Fee Payment Details"
                              >
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFeeToDelete(fee);
                                  setDeleteOpen(true);
                                }}
                                className="h-7 sm:h-8 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold text-xs gap-1 rounded-lg"
                                title="Delete Fee Record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                                {fee.status === "verified" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenFeeReceipt(fee)}
                                    className="h-7 sm:h-8 px-2 sm:px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-xs gap-1.5 rounded-lg shadow-sm"
                                    title="Print / Share Official Receipt"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>Receipt</span>
                                  </Button>
                                ) : null}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEdit(fee)}
                                  className="h-7 sm:h-8 px-2 sm:px-2 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-semibold text-xs gap-1 rounded-lg"
                                  title="Edit Fee Payment Details"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setFeeToDelete(fee);
                                    setDeleteOpen(true);
                                  }}
                                  className="h-7 sm:h-8 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold text-xs gap-1 rounded-lg"
                                  title="Delete Fee Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only sm:not-sr-only">Delete</span>
                                </Button>
                              </div>
                              <div className="text-slate-400 text-[10px] sm:text-[11px] font-normal text-center">
                                By <span className="font-bold text-slate-600">{fee.verifier?.full_name || "Accounts"}</span>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-extrabold text-slate-900">Provide Rejection Remarks</DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              State the reason for rejecting this fee submission. The student will see this note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="font-semibold text-xs sm:text-sm">Rejection Notes <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="e.g. Transaction Reference number does not match bank records."
              className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              disabled={rejecting}
              onClick={() => setRejectOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejecting}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[150px] text-xs sm:text-sm shadow-md shadow-rose-600/20"
            >
              {rejecting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rejecting...
                </span>
              ) : (
                "Reject Submission"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Payment Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Pencil className="h-5 w-5 text-indigo-600" />
              Edit Fee Payment & Bill
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Update billing details, payment method, amount, status, or student particulars.
            </DialogDescription>
          </DialogHeader>

          {/* Student Info Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {editForm.studentName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {editForm.studentEmail}
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold bg-white text-indigo-700 border-indigo-200 shrink-0">
              ID: #{editForm.id ? editForm.id.slice(0, 8) : "N/A"}
            </Badge>
          </div>

          <div className="space-y-3.5 py-1">
            {/* Target Course Select */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Course / Academic Program</Label>
              <Select
                value={editForm.course_id}
                onValueChange={(val) => setEditForm({ ...editForm, course_id: val })}
              >
                <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bill Date & Time */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs sm:text-sm">Bill Date & Time <span className="text-rose-500">*</span></Label>
                <span className="text-[10px] text-slate-500 font-medium">Recorded on official voucher</span>
              </div>
              <Input
                type="datetime-local"
                className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                value={editForm.payment_date}
                onChange={(e) => setEditForm({ ...editForm, payment_date: e.target.value })}
              />
            </div>

            {/* Amount Paid & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Amount Paid (₹) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    placeholder="e.g. 15000"
                    className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                    value={editForm.amount_paid}
                    onChange={(e) => setEditForm({ ...editForm, amount_paid: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Payment Method <span className="text-rose-500">*</span></Label>
                <Select
                  value={editForm.payment_method}
                  onValueChange={(val) => setEditForm({ ...editForm, payment_method: val })}
                >
                  <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash Deposit</SelectItem>
                    <SelectItem value="UPI">UPI Transfer</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Wire Transfer</SelectItem>
                    <SelectItem value="Card">Debit/Credit Card</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transaction Ref & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Transaction ID / Reference</Label>
                <Input
                  placeholder="e.g. UPI-98273618 / CASH-082"
                  className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                  value={editForm.transaction_id}
                  onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Status <span className="text-rose-500">*</span></Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified & Approved</SelectItem>
                    <SelectItem value="pending">Pending Verification</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student Particulars Accordion / Fields for Bill */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Voucher Particulars (Printed on Bill Receipt)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Roll / Registration No.</Label>
                  <Input
                    placeholder="e.g. AIMS-2026-0042"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                    value={editForm.roll_no}
                    onChange={(e) => setEditForm({ ...editForm, roll_no: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Guardian / Parent Name</Label>
                  <Input
                    placeholder="e.g. Mr. Ramesh Nayak"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                    value={editForm.guardian_name}
                    onChange={(e) => setEditForm({ ...editForm, guardian_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Student Address / Location</Label>
                <Input
                  placeholder="e.g. Salipur, Cuttack, Odisha - 754202"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Notes / Payment Description</Label>
                <Input
                  placeholder="e.g. Installment 1 / Full Coaching Fee"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3">
            <Button
              variant="outline"
              disabled={updatingFee}
              onClick={() => setEditOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updatingFee}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-indigo-600/20"
            >
              {updatingFee ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Fee Record Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6 rounded-2xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Delete Fee Record?
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-600 text-xs sm:text-sm">
              Are you sure you want to permanently delete this fee payment of{" "}
              <span className="font-extrabold text-slate-900">
                {feeToDelete ? formatCurrency(feeToDelete.amount_paid) : ""}
              </span>{" "}
              for{" "}
              <span className="font-bold text-slate-900">
                {feeToDelete?.student?.full_name || "this student"}
              </span>?
              <br />
              <span className="text-rose-600 font-semibold block mt-1.5">
                This will also reverse any corresponding entry in the finance ledger. This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3">
            <Button
              variant="outline"
              disabled={deletingFee}
              onClick={() => {
                setDeleteOpen(false);
                setFeeToDelete(null);
              }}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deletingFee}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-rose-600/20"
            >
              {deletingFee ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Yes, Delete Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Student Fee Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        data={receiptData}
      />
    </div>
  );
}
