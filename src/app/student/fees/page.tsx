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
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  DollarSign,
  FileCheck2,
  Calendar,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Share2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ReceiptModal, ReceiptData } from "@/components/finance/receipt-modal";
import { subscribeToDataRefresh } from "@/lib/refresh-event";
import { cn } from "@/lib/utils";

export default function StudentFeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchFees = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/student/fees");
      if (res.ok) {
        const data = await res.json();
        setFees(data.fees || []);
        if (data.student) setStudentProfile(data.student);
      }
      if (!silent) {
        toast({
          title: "Fee Records Updated 🧾",
          description: "Latest fee payments and bills loaded.",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching student fees:", err);
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFees(true);
    return subscribeToDataRefresh(() => {
      fetchFees(true);
    });
  }, []);

  const handleOpenReceipt = (fee: any) => {
    const cleanId = fee.id ? fee.id.replace(/-/g, "").slice(0, 8).toUpperCase() : String(Math.floor(100000 + Math.random() * 900000));
    const receiptNo = `AIMS-FEE-${cleanId}`;

    const studentName = studentProfile?.full_name || "AIMS Enrolled Student";
    const studentEmail = studentProfile?.email;
    const studentPhone = studentProfile?.whatsapp;
    const course = fee.course?.title || studentProfile?.course_of_interest || "AIMS Nursing & Medical Coaching";

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalPaid = fees
    .filter((f) => f.status === "verified")
    .reduce((acc, f) => acc + (Number(f.amount_paid) || 0), 0);

  const verifiedCount = fees.filter((f) => f.status === "verified").length;
  const pendingCount = fees.filter((f) => f.status === "pending").length;

  const filteredFees = fees.filter((f) => {
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const courseTitle = (f.course?.title || "").toLowerCase();
    const ref = (f.transaction_id || "").toLowerCase();
    const remarks = (f.remarks || "").toLowerCase();
    return courseTitle.includes(term) || ref.includes(term) || remarks.includes(term);
  });

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            Official Student Billing & Accounts
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fee Bills & Receipts 🧾
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-semibold">
            View your fee payments, official receipts, and download or print complete voucher bills.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchFees(false)}
            disabled={isRefreshing}
            className="h-10 sm:h-11 px-3.5 gap-2 border-slate-200 text-slate-700 hover:text-aims-navy hover:bg-slate-50 font-bold rounded-xl"
            title="Refresh Fee Bills"
          >
            <RotateCw className={cn("h-4 w-4 text-aims-navy", isRefreshing && "animate-spin")} />
            <span className="text-xs sm:text-sm font-bold">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-indigo-50/80 to-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Fees Verified
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                {formatCurrency(totalPaid)}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">
                ✓ Settled & approved by accounts
              </span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50/80 to-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verified Receipts
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                {verifiedCount}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                Available for instant PDF download
              </span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Verification
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-800">
                {pendingCount}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                Under review by finance office
              </span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Card */}
      <Card className="border-slate-100 overflow-hidden shadow-xs bg-white">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              Official Bills Ledger
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Click &quot;Download / Print Bill&quot; to print or save your official PDF voucher.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search course or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 w-full sm:w-64 text-xs sm:text-sm rounded-xl font-medium"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("verified")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  statusFilter === "verified" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Verified
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-semibold text-xs sm:text-sm">
              Loading your fee bills and receipts...
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <FileCheck2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">No Fee Bills Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                {searchTerm
                  ? `No bills match "${searchTerm}".`
                  : "You have no recorded fee payments yet. Once your course fees are recorded, your official receipts will appear here."}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="rounded-xl">
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                      <th className="py-3.5 px-4 lg:px-6">Bill / Receipt No</th>
                      <th className="py-3.5 px-4 lg:px-6">Date & Time</th>
                      <th className="py-3.5 px-4 lg:px-6">Course / Particulars</th>
                      <th className="py-3.5 px-4 lg:px-6">Payment Method</th>
                      <th className="py-3.5 px-4 lg:px-6">Amount</th>
                      <th className="py-3.5 px-4 lg:px-6">Status</th>
                      <th className="py-3.5 px-4 lg:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredFees.map((fee) => {
                      const cleanId = fee.id ? fee.id.replace(/-/g, "").slice(0, 8).toUpperCase() : "";
                      const receiptNo = `AIMS-FEE-${cleanId}`;
                      const formattedDate = new Date(fee.payment_date || fee.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const formattedTime = new Date(fee.payment_date || fee.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 lg:px-6 font-mono font-bold text-indigo-700">
                            {receiptNo}
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="font-bold text-slate-900">{formattedDate}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{formattedTime}</div>
                          </td>
                          <td className="py-4 px-4 lg:px-6 max-w-[240px]">
                            <div className="font-bold text-slate-900 truncate">
                              {fee.course?.title || studentProfile?.course_of_interest || "Course Tuition Fee"}
                            </div>
                            {fee.remarks && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[220px]" title={fee.remarks}>
                                {fee.remarks}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <Badge variant="outline" className="font-bold text-[10px] bg-slate-50">
                              {fee.payment_method}
                            </Badge>
                            {fee.transaction_id && (
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px] mt-0.5">
                                Ref: {fee.transaction_id}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 lg:px-6 font-extrabold text-slate-900 text-sm">
                            {formatCurrency(fee.amount_paid)}
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            {fee.status === "verified" ? (
                              <Badge variant="success" className="text-[11px] font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : fee.status === "rejected" ? (
                              <Badge variant="destructive" className="text-[11px] font-bold">
                                Rejected
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleOpenReceipt(fee)}
                              className="h-8 px-3 gap-1.5 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Download / Print
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100 p-3 sm:p-4 space-y-3">
                {filteredFees.map((fee) => {
                  const cleanId = fee.id ? fee.id.replace(/-/g, "").slice(0, 8).toUpperCase() : "";
                  const receiptNo = `AIMS-FEE-${cleanId}`;
                  const formattedDate = new Date(fee.payment_date || fee.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = new Date(fee.payment_date || fee.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={fee.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-indigo-700">
                          {receiptNo}
                        </span>
                        {fee.status === "verified" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Verified
                          </Badge>
                        ) : fee.status === "rejected" ? (
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            Rejected
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {fee.course?.title || studentProfile?.course_of_interest || "Course Tuition Fee"}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Amount Paid ({fee.payment_method})
                          </span>
                          <span className="text-base font-extrabold text-slate-900">
                            {formatCurrency(fee.amount_paid)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleOpenReceipt(fee)}
                          className="h-8 px-3 gap-1.5 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Bill
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Official Voucher Print Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        data={receiptData}
      />
    </div>
  );
}
