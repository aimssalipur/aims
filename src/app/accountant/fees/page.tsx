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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AccountantFeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logOpen, setLogOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [form, setForm] = useState({
    student_id: "",
    amount_paid: "",
    payment_method: "UPI",
    transaction_id: "",
    remarks: "",
    status: "verified", // Manual logging by accountant is pre-verified
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
    fetchStudents();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("log") === "true") {
        setLogOpen(true);
      }
    }
  }, []);

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch("/api/accountant/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "verified" }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Verification failed",
          description: data.error,
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
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectionReason("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast({
        title: "Remarks required",
        description: "Please explain the reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/accountant/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectId, status: "rejected", remarks: rejectionReason }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Rejection failed",
          description: data.error,
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
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleManualLog = async () => {
    if (!form.student_id || !form.amount_paid || !form.payment_method) {
      toast({
        title: "Missing fields",
        description: "Please select a student, amount, and payment method.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/accountant/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to record payment",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment recorded ✅",
          description: "Manually logged student fee payment successfully.",
          variant: "success",
        });
        setLogOpen(false);
        fetchFees();
        setForm({
          student_id: "",
          amount_paid: "",
          payment_method: "UPI",
          transaction_id: "",
          remarks: "",
          status: "verified",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error logging payment",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredFees = fees.filter((fee) => {
    const studentName = fee.student?.full_name?.toLowerCase() || "";
    const studentEmail = fee.student?.email?.toLowerCase() || "";
    const refNo = fee.transaction_id?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return studentName.includes(term) || studentEmail.includes(term) || refNo.includes(term);
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
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-0 font-bold rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Record Cash/Office Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900">Record Offline Payment</DialogTitle>
                <DialogDescription className="font-semibold text-slate-400">
                  Log direct payments paid directly at the office counter.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                {/* Student Select */}
                <div className="space-y-2">
                  <Label className="font-semibold">Select Student</Label>
                  <Select
                    value={form.student_id}
                    onValueChange={(val) => setForm({ ...form, student_id: val })}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Search student profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.course_of_interest || "No Course Specified"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Paid */}
                <div className="space-y-2">
                  <Label className="font-semibold">Amount Paid (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      className="pl-8 h-11 rounded-xl font-bold text-slate-900"
                      value={form.amount_paid}
                      onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="font-semibold">Payment Method</Label>
                  <Select
                    value={form.payment_method}
                    onValueChange={(val) => setForm({ ...form, payment_method: val })}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
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

                {/* Trans Reference */}
                <div className="space-y-2">
                  <Label className="font-semibold">Transaction ID / Reference (Optional)</Label>
                  <Input
                    placeholder="e.g. UPI-98273618 / CASH-082"
                    className="h-11 rounded-xl font-mono"
                    value={form.transaction_id}
                    onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label className="font-semibold">Remarks</Label>
                  <Input
                    placeholder="e.g. Installment 1 / Full Semester Fee"
                    className="h-11 rounded-xl"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setLogOpen(false)} className="rounded-xl h-11 font-semibold">
                  Cancel
                </Button>
                <Button onClick={handleManualLog} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold">
                  Log payment
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
            <div className="overflow-x-auto">
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
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 sm:h-9 font-bold px-2 sm:px-3 text-[11px] sm:text-xs"
                              onClick={() => handleVerify(fee.id)}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg h-7 sm:h-9 font-bold px-2 sm:px-3 text-[11px] sm:text-xs"
                              onClick={() => openRejectDialog(fee.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] sm:text-xs font-normal">
                            Processed by
                            <span className="block font-bold text-slate-500">
                              {fee.verifier?.full_name || "Accountant"}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Reject Remarks Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">Provide Rejection Remarks</DialogTitle>
            <DialogDescription className="font-semibold text-slate-400">
              State the reason for rejecting this fee submission. The student will see this note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="font-semibold">Rejection Notes</Label>
            <Input
              placeholder="e.g. Transaction Reference number does not match bank records."
              className="h-11 rounded-xl"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl h-11 font-semibold">
              Cancel
            </Button>
            <Button onClick={handleReject} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 font-bold">
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
