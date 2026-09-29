"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/lib/use-debounce";
import {
  Landmark,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  Loader2,
  RotateCw,
  Calculator,
  Percent,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  HelpCircle,
  ChevronDown,
  Printer,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";
import { subscribeToDataRefresh, triggerDataRefresh } from "@/lib/refresh-event";
import { cn } from "@/lib/utils";
import { computeLoanMetrics } from "@/lib/loan-calculator";
import { ReceiptModal, ReceiptData } from "@/components/finance/receipt-modal";

export default function AccountantCapitalPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalPrincipalBorrowed: 0,
    totalBankLoans: 0,
    totalPrivateBorrowings: 0,
    totalInterestPayable: 0,
    totalAmountRepaid: 0,
    totalOutstandingBalance: 0,
    activeLoansCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Modals state
  const [addBankLoanOpen, setAddBankLoanOpen] = useState(false);
  const [addPrivateLenderOpen, setAddPrivateLenderOpen] = useState(false);
  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Form states
  const [bankForm, setBankForm] = useState({
    lender_name: "",
    account_number: "",
    principal_amount: "",
    interest_rate_percent: "9.5",
    tenure_years: "3",
    tenure_months: "36",
    tenure_mode: "years",
    interest_type: "reducing_emi",
    received_date: new Date().toISOString().split("T")[0],
    payment_method: "Bank Transfer",
    payment_reference: "",
    purpose: "Campus expansion / Infrastructure",
    notes: "",
    sync_to_ledger: true,
  });

  const [privateForm, setPrivateForm] = useState({
    lender_name: "",
    lender_contact: "",
    principal_amount: "",
    interest_rate_percent: "0",
    tenure_months: "12",
    interest_type: "zero_interest",
    received_date: new Date().toISOString().split("T")[0],
    due_date: "",
    payment_method: "UPI",
    payment_reference: "",
    purpose: "Short-term operating capital",
    notes: "",
    sync_to_ledger: true,
  });

  const [repaymentForm, setRepaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Bank Transfer",
    payment_reference: "",
    notes: "",
    sync_to_ledger: true,
  });

  // Standalone Simulator Calculator state
  const [calcPrincipal, setCalcPrincipal] = useState("500000");
  const [calcRate, setCalcRate] = useState("9.0");
  const [calcTenureYears, setCalcTenureYears] = useState("3");
  const [calcInterestType, setCalcInterestType] = useState<"reducing_emi" | "flat_simple">("reducing_emi");

  const debouncedSearch = useDebounce(searchTerm, 350);

  const handleOpenCapitalReceipt = (r: any) => {
    const cleanId = r.id ? r.id.replace(/-/g, "").slice(0, 8).toUpperCase() : String(Math.floor(100000 + Math.random() * 900000));
    const isBank = r.borrowing_type === "bank_loan";
    const receiptNo = `AIMS-CAP-${cleanId}`;

    const data: ReceiptData = {
      receiptNo,
      date: r.received_date || new Date(),
      type: "capital",
      title: isBank ? "Bank Capital Loan Inflow Voucher" : "Private Capital Borrowing Voucher",
      partyName: r.lender_name || "Lending Partner / Institution",
      partyRoleOrCourse: isBank
        ? `Commercial Bank (${r.interest_rate_percent}% p.a. · ${r.tenure_months} Months)`
        : `Private Lender (${r.interest_rate_percent > 0 ? `${r.interest_rate_percent}% p.a.` : "Zero-Interest"} · ${r.tenure_months} Months)`,
      partyContact: r.lender_contact || (r.account_number ? `A/c: ${r.account_number}` : undefined),
      category: isBank ? "Bank Loan Capital" : "Private Borrowing Capital",
      amount: Number(r.principal_amount) || 0,
      paymentMethod: r.payment_method || "Bank Transfer",
      referenceNo: r.payment_reference || undefined,
      description: r.purpose ? `Capital Inflow: ${r.purpose}` : `Capital borrowing from ${r.lender_name}`,
      recordedBy: "AIMS Accounts Dept",
      verifiedBy: "AIMS Management",
      status: r.status === "settled" ? "Fully Repaid & Closed" : "Active & Verified",
      breakdownItems: [
        { label: `Total Payable with Interest: ₹${Number(r.total_payable || 0).toLocaleString("en-IN")}`, amount: Number(r.total_payable || 0) },
        { label: `Repaid to Date: ₹${Number(r.amount_repaid || 0).toLocaleString("en-IN")}`, amount: Number(r.amount_repaid || 0) },
      ],
    };

    setReceiptData(data);
    setReceiptOpen(true);
  };

  const handleOpenRepaymentReceipt = (rp: any, loan: any) => {
    const cleanId = rp.id ? rp.id.replace(/-/g, "").slice(0, 8).toUpperCase() : String(Math.floor(100000 + Math.random() * 900000));
    const receiptNo = `AIMS-REP-${cleanId}`;

    const data: ReceiptData = {
      receiptNo,
      date: rp.payment_date || new Date(),
      type: "repayment",
      title: "Loan Installment Repayment Voucher",
      partyName: loan?.lender_name || "Lending Institution",
      partyRoleOrCourse: `Borrowing Ref: ${loan?.id ? loan.id.slice(0, 8).toUpperCase() : "N/A"} · ${loan?.borrowing_type === "bank_loan" ? "Bank Loan" : "Private Borrowing"}`,
      partyContact: loan?.lender_contact || (loan?.account_number ? `A/c: ${loan.account_number}` : undefined),
      category: "Debt Repayment / Installment",
      amount: Number(rp.amount) || 0,
      paymentMethod: rp.payment_method || "Bank Transfer",
      referenceNo: rp.payment_reference || undefined,
      description: rp.notes || `Installment repayment toward ${loan?.lender_name || "lender"} capital loan`,
      recordedBy: "AIMS Accounts Dept",
      verifiedBy: "AIMS Finance Officer",
      status: "Payment Processed & Settled",
    };

    setReceiptData(data);
    setReceiptOpen(true);
  };

  // Auto-calculated values for Bank Loan Form
  const liveBankCalculation = useMemo(() => {
    const P = Number(bankForm.principal_amount) || 0;
    const R = Number(bankForm.interest_rate_percent) || 0;
    const months = bankForm.tenure_mode === "years"
      ? (Number(bankForm.tenure_years) || 1) * 12
      : (Number(bankForm.tenure_months) || 12);

    return computeLoanMetrics({
      principal: P,
      annualRate: R,
      tenureMonths: months,
      interestType: bankForm.interest_type as any,
    });
  }, [bankForm.principal_amount, bankForm.interest_rate_percent, bankForm.tenure_years, bankForm.tenure_months, bankForm.tenure_mode, bankForm.interest_type]);

  // Auto-calculated values for Private Lender Form
  const livePrivateCalculation = useMemo(() => {
    const P = Number(privateForm.principal_amount) || 0;
    const R = Number(privateForm.interest_rate_percent) || 0;
    const months = Number(privateForm.tenure_months) || 12;

    return computeLoanMetrics({
      principal: P,
      annualRate: R,
      tenureMonths: months,
      interestType: privateForm.interest_type as any,
    });
  }, [privateForm.principal_amount, privateForm.interest_rate_percent, privateForm.tenure_months, privateForm.interest_type]);

  // Auto-calculated values for Standalone Calculator Tab
  const liveSimulatorCalculation = useMemo(() => {
    const P = Number(calcPrincipal) || 0;
    const R = Number(calcRate) || 0;
    const months = (Number(calcTenureYears) || 1) * 12;

    return computeLoanMetrics({
      principal: P,
      annualRate: R,
      tenureMonths: months,
      interestType: calcInterestType,
    });
  }, [calcPrincipal, calcRate, calcTenureYears, calcInterestType]);

  const fetchCapitalData = async () => {
    try {
      const q = new URLSearchParams();
      if (typeFilter !== "all") q.append("type", typeFilter);
      if (statusFilter !== "all") q.append("status", statusFilter);
      if (debouncedSearch) q.append("search", debouncedSearch);

      const res = await fetch(`/api/accountant/capital?${q.toString()}`);
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading capital ledger",
        description: "Failed to connect to capital inflow data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapitalData();
  }, [typeFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchCapitalData();
    });
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchCapitalData();
      toast({
        title: "Capital Data Refreshed ✅",
        description: "Latest bank loans and borrowings loaded.",
        variant: "success",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCreateBankLoan = async () => {
    if (submitting) return;

    if (!bankForm.lender_name || !bankForm.principal_amount) {
      toast({
        title: "Missing bank details",
        description: "Please specify the bank name and loan principal amount.",
        variant: "destructive",
      });
      return;
    }

    const months = bankForm.tenure_mode === "years"
      ? Math.max(1, Math.round((Number(bankForm.tenure_years) || 1) * 12))
      : Math.max(1, Math.round(Number(bankForm.tenure_months) || 12));

    setSubmitting(true);
    try {
      const res = await fetch("/api/accountant/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bank_loan",
          lender_name: bankForm.lender_name,
          account_number: bankForm.account_number,
          principal_amount: Number(bankForm.principal_amount),
          interest_rate_percent: Number(bankForm.interest_rate_percent) || 0,
          tenure_months: months,
          interest_type: bankForm.interest_type,
          received_date: bankForm.received_date,
          payment_method: bankForm.payment_method,
          payment_reference: bankForm.payment_reference,
          purpose: bankForm.purpose,
          notes: bankForm.notes,
          sync_to_ledger: bankForm.sync_to_ledger,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Could not record bank loan",
          description: getFriendlyErrorMessage(data.error || "Failed to log loan."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bank Loan Logged 🏦",
          description: `Logged ₹${Number(bankForm.principal_amount).toLocaleString("en-IN")} from ${bankForm.lender_name}.`,
          variant: "success",
        });
        setAddBankLoanOpen(false);
        fetchCapitalData();
        triggerDataRefresh();
        setBankForm({
          lender_name: "",
          account_number: "",
          principal_amount: "",
          interest_rate_percent: "9.5",
          tenure_years: "3",
          tenure_months: "36",
          tenure_mode: "years",
          interest_type: "reducing_emi",
          received_date: new Date().toISOString().split("T")[0],
          payment_method: "Bank Transfer",
          payment_reference: "",
          purpose: "Campus expansion / Infrastructure",
          notes: "",
          sync_to_ledger: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Could not record bank loan",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePrivateLender = async () => {
    if (submitting) return;

    if (!privateForm.lender_name || !privateForm.principal_amount) {
      toast({
        title: "Missing lender details",
        description: "Please specify the lender's name and amount borrowed.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/accountant/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "private_lender",
          lender_name: privateForm.lender_name,
          lender_contact: privateForm.lender_contact,
          principal_amount: Number(privateForm.principal_amount),
          interest_rate_percent: Number(privateForm.interest_rate_percent) || 0,
          tenure_months: Number(privateForm.tenure_months) || 12,
          interest_type: privateForm.interest_type,
          received_date: privateForm.received_date,
          due_date: privateForm.due_date || null,
          payment_method: privateForm.payment_method,
          payment_reference: privateForm.payment_reference,
          purpose: privateForm.purpose,
          notes: privateForm.notes,
          sync_to_ledger: privateForm.sync_to_ledger,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Could not save borrowing",
          description: getFriendlyErrorMessage(data.error || "Failed to log private borrowing."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Private Inflow Saved 🤝",
          description: `Logged ₹${Number(privateForm.principal_amount).toLocaleString("en-IN")} from ${privateForm.lender_name} via ${privateForm.payment_method}.`,
          variant: "success",
        });
        setAddPrivateLenderOpen(false);
        fetchCapitalData();
        triggerDataRefresh();
        setPrivateForm({
          lender_name: "",
          lender_contact: "",
          principal_amount: "",
          interest_rate_percent: "0",
          tenure_months: "12",
          interest_type: "zero_interest",
          received_date: new Date().toISOString().split("T")[0],
          due_date: "",
          payment_method: "UPI",
          payment_reference: "",
          purpose: "Short-term operating capital",
          notes: "",
          sync_to_ledger: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Could not save borrowing",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordRepayment = async () => {
    if (repaying || !selectedLoan) return;

    if (!repaymentForm.amount || Number(repaymentForm.amount) <= 0) {
      toast({
        title: "Invalid repayment amount",
        description: "Please specify a positive installment amount.",
        variant: "destructive",
      });
      return;
    }

    setRepaying(true);
    try {
      const res = await fetch("/api/accountant/capital/repayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_id: selectedLoan.id,
          amount: Number(repaymentForm.amount),
          payment_date: repaymentForm.payment_date,
          payment_method: repaymentForm.payment_method,
          payment_reference: repaymentForm.payment_reference,
          notes: repaymentForm.notes,
          sync_to_ledger: repaymentForm.sync_to_ledger,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Could not record repayment",
          description: getFriendlyErrorMessage(data.error || "Failed to record payment."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Repayment Recorded ✅",
          description: `Paid ₹${Number(repaymentForm.amount).toLocaleString("en-IN")} towards ${selectedLoan.lender_name}.`,
          variant: "success",
        });
        setRepaymentModalOpen(false);
        fetchCapitalData();
        triggerDataRefresh();
        setRepaymentForm({
          amount: "",
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "Bank Transfer",
          payment_reference: "",
          notes: "",
          sync_to_ledger: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Could not record repayment",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setRepaying(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Are you sure you want to delete this capital record? All associated repayment logs will also be permanently deleted.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/accountant/capital?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "Could not delete record",
          description: getFriendlyErrorMessage(data.error || "Failed to delete."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Record Deleted",
          description: "Capital entry removed successfully.",
          variant: "success",
        });
        fetchCapitalData();
        triggerDataRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Error deleting",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Filtered records by active tab
  const tabFilteredRecords = useMemo(() => {
    if (activeTab === "bank") {
      return records.filter((r) => r.type === "bank_loan");
    }
    if (activeTab === "private") {
      return records.filter((r) => r.type !== "bank_loan");
    }
    return records;
  }, [records, activeTab]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1440px] mx-auto pb-10">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/15 border-indigo-200/50 font-bold text-xs gap-1.5 px-2.5 py-0.5">
              <Landmark className="h-3.5 w-3.5 text-indigo-600" /> Capital & Inflows
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200/50 font-bold text-[10px] uppercase tracking-wider">
              Auto-Calculations Active
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
            Capital Inflow & Loans Management 🏦
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-semibold">
            Track bank loans, auto-calculate interest % & monthly EMIs, and log private individual lenders via Cash, UPI, or Cheque.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3 sm:px-4 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Refresh Capital Data"
          >
            <RotateCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          {/* Add Bank Loan Trigger */}
          <Button
            size="sm"
            onClick={() => setAddBankLoanOpen(true)}
            className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-4 shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold rounded-xl"
          >
            <Building2 className="h-4 w-4" />
            + Add Bank Loan
          </Button>

          {/* Add Private Lender Trigger */}
          <Button
            size="sm"
            onClick={() => setAddPrivateLenderOpen(true)}
            className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-4 shadow-lg shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl"
          >
            <Wallet className="h-4 w-4" />
            + Private Borrowing
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">Total Capital Inflow</span>
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 sm:mt-2">
              {formatCurrency(metrics.totalPrincipalBorrowed)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Across {metrics.totalCount} external funding sources
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">Bank Loans Debt</span>
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-blue-700 mt-1 sm:mt-2">
              {formatCurrency(metrics.totalBankLoans)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              +{formatCurrency(metrics.totalInterestPayable)} total interest
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">Private People Inflows</span>
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-teal-700 mt-1 sm:mt-2">
              {formatCurrency(metrics.totalPrivateBorrowings)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Cash, UPI, & Cheque borrowings
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">Current Balance to Repay</span>
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-rose-600 mt-1 sm:mt-2">
              {formatCurrency(metrics.totalOutstandingBalance)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Repaid: {formatCurrency(metrics.totalAmountRepaid)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Section with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="h-10 sm:h-11 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm font-bold">
              All Inflows ({records.length})
            </TabsTrigger>
            <TabsTrigger value="bank" className="rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Bank Loans ({records.filter((r) => r.type === "bank_loan").length})
            </TabsTrigger>
            <TabsTrigger value="private" className="rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Private Lenders ({records.filter((r) => r.type !== "bank_loan").length})
            </TabsTrigger>
            <TabsTrigger value="calculator" className="rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 text-indigo-700">
              <Calculator className="h-3.5 w-3.5" />
              EMI Calculator
            </TabsTrigger>
          </TabsList>

          {activeTab !== "calculator" && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search lender or account..."
                  className="pl-9 h-9 sm:h-10 text-xs sm:text-sm rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 sm:h-10 w-32 rounded-xl text-xs sm:text-sm font-semibold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="settled">Settled / Repaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tab 1, 2, 3: Ledger Table */}
        {activeTab !== "calculator" && (
          <Card className="border-slate-100 bg-white overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Loading capital inflows...
              </div>
            ) : tabFilteredRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-xs sm:text-sm space-y-2">
                <p>No capital inflow records found matching criteria.</p>
                <p className="text-[11px] text-slate-400">
                  Use &quot;+ Add Bank Loan&quot; or &quot;+ Private Borrowing&quot; to log external funds.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] sm:text-[10px] font-bold tracking-wider bg-slate-50/60">
                      <th className="py-3 px-4 sm:px-6">Type & Source</th>
                      <th className="py-3 px-4 sm:px-6">Principal Borrowed</th>
                      <th className="py-3 px-4 sm:px-6">Interest & Terms</th>
                      <th className="py-3 px-4 sm:px-6">Monthly EMI</th>
                      <th className="py-3 px-4 sm:px-6">Total Payable</th>
                      <th className="py-3 px-4 sm:px-6">Repaid / Balance</th>
                      <th className="py-3 px-4 sm:px-6">Status</th>
                      <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                    {tabFilteredRecords.map((r: any) => {
                      const isBank = r.type === "bank_loan";
                      const progressPercent = Math.min(100, Math.round(((r.amount_repaid || 0) / (r.total_payable || 1)) * 100));

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-bold flex items-center gap-1.5">
                                {isBank ? (
                                  <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                ) : (
                                  <Wallet className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                )}
                                {r.lender_name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                                <span>{isBank ? "Bank Loan" : `Lender via ${r.payment_method}`}</span>
                                {r.account_number && <span>· A/c: {r.account_number}</span>}
                                {r.lender_contact && <span>· Ph: {r.lender_contact}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 font-extrabold text-slate-900 text-sm whitespace-nowrap">
                            {formatCurrency(r.principal_amount)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-bold">
                                {r.interest_rate_percent}% p.a.
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {Math.round(r.tenure_months / 12 * 10) / 10} yrs ({r.tenure_months} mo)
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            {r.monthly_emi > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-extrabold text-indigo-600">
                                  {formatCurrency(r.monthly_emi)}/mo
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Int: {formatCurrency(r.total_interest)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-normal">Interest-free</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(r.total_payable)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-emerald-600 font-bold">{formatCurrency(r.amount_repaid)}</span>
                                <span className="text-rose-600 font-bold">{formatCurrency(r.remaining_balance)}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            {r.status === "settled" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Settled
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px]">
                                <Clock className="h-3 w-3 mr-1 text-amber-600" /> Active
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {r.status !== "settled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLoan(r);
                                    setRepaymentForm((prev) => ({
                                      ...prev,
                                      amount: r.monthly_emi > 0 ? String(r.monthly_emi) : String(r.remaining_balance),
                                    }));
                                    setRepaymentModalOpen(true);
                                  }}
                                  className="h-8 px-2.5 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-lg"
                                >
                                  Pay Installment
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenCapitalReceipt(r)}
                                className="h-8 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg"
                                title="Print / Share Inflow Voucher"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLoan(r);
                                  setHistoryModalOpen(true);
                                }}
                                className="h-8 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                title="View repayment history"
                              >
                                <History className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={deletingId === r.id}
                                onClick={() => handleDeleteRecord(r.id)}
                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                                title="Delete record"
                              >
                                {deletingId === r.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 4: Standalone EMI & Loan Calculator */}
        <TabsContent value="calculator" className="space-y-4">
          <Card className="border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50/50 border-b border-indigo-100/60 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Loan & Borrowing EMI Simulator
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">
                    Simulate future bank borrowings, test interest rates, and see exact monthly installments before applying.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 grid lg:grid-cols-3 gap-6 items-start">
              {/* Controls */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Principal */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs sm:text-sm">Principal Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <Input
                        type="number"
                        value={calcPrincipal}
                        onChange={(e) => setCalcPrincipal(e.target.value)}
                        className="pl-8 h-11 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs sm:text-sm">Annual Interest Rate (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        value={calcRate}
                        onChange={(e) => setCalcRate(e.target.value)}
                        className="pr-8 h-11 rounded-xl font-bold text-slate-900 text-sm"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Tenure in Years */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs sm:text-sm">Tenure (Years)</Label>
                    <Select value={calcTenureYears} onValueChange={setCalcTenureYears}>
                      <SelectTrigger className="h-11 rounded-xl font-semibold text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year (12 months)</SelectItem>
                        <SelectItem value="2">2 Years (24 months)</SelectItem>
                        <SelectItem value="3">3 Years (36 months)</SelectItem>
                        <SelectItem value="4">4 Years (48 months)</SelectItem>
                        <SelectItem value="5">5 Years (60 months)</SelectItem>
                        <SelectItem value="7">7 Years (84 months)</SelectItem>
                        <SelectItem value="10">10 Years (120 months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Type */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs sm:text-sm">Calculation Method</Label>
                    <Select value={calcInterestType} onValueChange={(val: any) => setCalcInterestType(val)}>
                      <SelectTrigger className="h-11 rounded-xl font-semibold text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reducing_emi">Standard Bank EMI (Reducing Balance)</SelectItem>
                        <SelectItem value="flat_simple">Flat Simple Interest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setCalcPrincipal("500000"); setCalcRate("9.5"); setCalcTenureYears("3"); }}
                      className="text-xs rounded-xl h-8"
                    >
                      ₹5 Lakhs @ 9.5% (3 Yr)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setCalcPrincipal("1000000"); setCalcRate("8.5"); setCalcTenureYears("5"); }}
                      className="text-xs rounded-xl h-8"
                    >
                      ₹10 Lakhs @ 8.5% (5 Yr)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setCalcPrincipal("2000000"); setCalcRate("9.0"); setCalcTenureYears("7"); }}
                      className="text-xs rounded-xl h-8"
                    >
                      ₹20 Lakhs @ 9.0% (7 Yr)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Result Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-400/20">
                  Estimated Breakdown
                </span>

                <div>
                  <div className="text-xs font-medium text-slate-400">Monthly Installment (EMI)</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
                    {formatCurrency(liveSimulatorCalculation.monthlyEmi)}
                    <span className="text-xs text-slate-400 font-semibold"> /month</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Principal Amount:</span>
                    <span className="font-bold text-white">{formatCurrency(Number(calcPrincipal) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Total Interest:</span>
                    <span className="font-bold text-amber-300">+{formatCurrency(liveSimulatorCalculation.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold text-white border-t border-white/10 pt-2">
                    <span>Total Amount to Pay:</span>
                    <span className="text-emerald-400">{formatCurrency(liveSimulatorCalculation.totalPayable)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setBankForm((prev) => ({
                      ...prev,
                      principal_amount: calcPrincipal,
                      interest_rate_percent: calcRate,
                      tenure_years: calcTenureYears,
                      tenure_mode: "years",
                    }));
                    setAddBankLoanOpen(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 text-xs shadow-lg"
                >
                  Use These Numbers in New Bank Loan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================== */}
      {/* MODAL 1: ADD BANK LOAN (WITH AUTO-CALCULATION)            */}
      {/* ======================================================== */}
      <Dialog open={addBankLoanOpen} onOpenChange={setAddBankLoanOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600 shrink-0" />
              Record Institutional Bank Loan
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Log bank borrowings. Monthly EMI and total repayment will auto-calculate in real time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 sm:space-y-4 py-2 sm:py-3">
            {/* Bank Name & Loan A/c */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Bank / Institution Name <span className="text-rose-500">*</span></Label>
                <Input
                  placeholder="e.g. State Bank of India / HDFC"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                  value={bankForm.lender_name}
                  onChange={(e) => setBankForm({ ...bankForm, lender_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Loan Account No. (Optional)</Label>
                <Input
                  placeholder="e.g. SBI-TL-98274618"
                  className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                />
              </div>
            </div>

            {/* Principal & Interest % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Principal Amount Taken (₹) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    placeholder="e.g. 1000000"
                    className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                    value={bankForm.principal_amount}
                    onChange={(e) => setBankForm({ ...bankForm, principal_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Annual Interest Rate (%) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.05"
                    placeholder="e.g. 9.5"
                    className="pr-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                    value={bankForm.interest_rate_percent}
                    onChange={(e) => setBankForm({ ...bankForm, interest_rate_percent: e.target.value })}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>
            </div>

            {/* Tenure & Calculation Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-xs sm:text-sm">Tenure <span className="text-rose-500">*</span></Label>
                  <div className="text-[10px] space-x-1">
                    <button
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, tenure_mode: "years" })}
                      className={cn("px-1.5 py-0.5 rounded font-bold", bankForm.tenure_mode === "years" ? "bg-indigo-100 text-indigo-700" : "text-slate-400")}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, tenure_mode: "months" })}
                      className={cn("px-1.5 py-0.5 rounded font-bold", bankForm.tenure_mode === "months" ? "bg-indigo-100 text-indigo-700" : "text-slate-400")}
                    >
                      Months
                    </button>
                  </div>
                </div>
                {bankForm.tenure_mode === "years" ? (
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 3 or 5"
                    className="h-10 sm:h-11 rounded-xl font-semibold text-xs sm:text-sm"
                    value={bankForm.tenure_years}
                    onChange={(e) => setBankForm({ ...bankForm, tenure_years: e.target.value })}
                  />
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 36 or 60"
                    className="h-10 sm:h-11 rounded-xl font-semibold text-xs sm:text-sm"
                    value={bankForm.tenure_months}
                    onChange={(e) => setBankForm({ ...bankForm, tenure_months: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Interest Calculation Mode</Label>
                <Select
                  value={bankForm.interest_type}
                  onValueChange={(val) => setBankForm({ ...bankForm, interest_type: val })}
                >
                  <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reducing_emi">Standard Bank EMI (Reducing Balance)</SelectItem>
                    <SelectItem value="flat_simple">Flat Simple Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* REAL-TIME AUTO-CALCULATION PREVIEW BOX */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50/60 border border-indigo-100 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-indigo-600" /> Auto-Calculated Repayment Terms
                </span>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Monthly Installment (EMI)</div>
                  <div className="text-sm sm:text-base font-extrabold text-indigo-700">
                    {formatCurrency(liveBankCalculation.monthlyEmi)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Total Interest Payable</div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-600">
                    {formatCurrency(liveBankCalculation.totalInterest)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Total Amount to Repay</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    {formatCurrency(liveBankCalculation.totalPayable)}
                  </div>
                </div>
              </div>
            </div>

            {/* Disbursal Date & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Disbursal Date <span className="text-rose-500">*</span></Label>
                <Input
                  type="date"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                  value={bankForm.received_date}
                  onChange={(e) => setBankForm({ ...bankForm, received_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Sanction / Ref No. (Optional)</Label>
                <Input
                  placeholder="e.g. SANC-2026-981"
                  className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                  value={bankForm.payment_reference}
                  onChange={(e) => setBankForm({ ...bankForm, payment_reference: e.target.value })}
                />
              </div>
            </div>

            {/* Purpose & Notes */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Loan Purpose / Remarks</Label>
              <Input
                placeholder="e.g. Purchase of Advanced Nursing Simulators & Lab equipment"
                className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
                value={bankForm.purpose}
                onChange={(e) => setBankForm({ ...bankForm, purpose: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setAddBankLoanOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBankLoan}
              disabled={submitting}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-indigo-600/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Loan...
                </span>
              ) : (
                "Save Bank Loan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: ADD PRIVATE LENDER / PEOPLE BORROWING           */}
      {/* ======================================================== */}
      <Dialog open={addPrivateLenderOpen} onOpenChange={setAddPrivateLenderOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-teal-600 shrink-0" />
              Record Private Borrowing / Individual Lender
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Record external money lent by individuals or partners via Cash, UPI, Cheque, or Bank Transfer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 sm:space-y-4 py-2 sm:py-3">
            {/* Lender Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Lender&apos;s Full Name <span className="text-rose-500">*</span></Label>
                <Input
                  placeholder="e.g. Ramesh Mohanty / Dr. S. Panda"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                  value={privateForm.lender_name}
                  onChange={(e) => setPrivateForm({ ...privateForm, lender_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Contact Number / WhatsApp</Label>
                <Input
                  placeholder="+91 98765 43210"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                  value={privateForm.lender_contact}
                  onChange={(e) => setPrivateForm({ ...privateForm, lender_contact: e.target.value })}
                />
              </div>
            </div>

            {/* Principal Amount & Payment Method (Cash, UPI, Cheque) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Principal Amount Borrowed (₹) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    placeholder="e.g. 200000"
                    className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                    value={privateForm.principal_amount}
                    onChange={(e) => setPrivateForm({ ...privateForm, principal_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Received Via <span className="text-rose-500">*</span></Label>
                <Select
                  value={privateForm.payment_method}
                  onValueChange={(val) => setPrivateForm({ ...privateForm, payment_method: val })}
                >
                  <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash Handover</SelectItem>
                    <SelectItem value="UPI">UPI (Google Pay / PhonePe / Paytm)</SelectItem>
                    <SelectItem value="Cheque">Bank Cheque</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Wire / IMPS / NEFT</SelectItem>
                    <SelectItem value="Demand Draft">Demand Draft (DD)</SelectItem>
                    <SelectItem value="Other">Other Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cheque / UPI Reference & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">
                  {privateForm.payment_method === "Cheque"
                    ? "Cheque No. & Bank Name"
                    : privateForm.payment_method === "UPI"
                    ? "UPI UTR / Ref No."
                    : "Payment Reference / Receipt"}
                </Label>
                <Input
                  placeholder={
                    privateForm.payment_method === "Cheque"
                      ? "e.g. CHQ-829104 (SBI)"
                      : privateForm.payment_method === "UPI"
                      ? "e.g. UPI-UTR-2938471"
                      : "e.g. Cash Receipt #042"
                  }
                  className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                  value={privateForm.payment_reference}
                  onChange={(e) => setPrivateForm({ ...privateForm, payment_reference: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Date Received <span className="text-rose-500">*</span></Label>
                <Input
                  type="date"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                  value={privateForm.received_date}
                  onChange={(e) => setPrivateForm({ ...privateForm, received_date: e.target.value })}
                />
              </div>
            </div>

            {/* Interest Terms & Target Repayment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Interest Terms</Label>
                <Select
                  value={privateForm.interest_type}
                  onValueChange={(val) => {
                    setPrivateForm({
                      ...privateForm,
                      interest_type: val,
                      interest_rate_percent: val === "zero_interest" ? "0" : privateForm.interest_rate_percent,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zero_interest">Interest-Free (0% Friendly Loan)</SelectItem>
                    <SelectItem value="flat_simple">Simple Fixed Interest %</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {privateForm.interest_type !== "zero_interest" ? (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Annual Interest Rate (%)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 6.0"
                      className="pr-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                      value={privateForm.interest_rate_percent}
                      onChange={(e) => setPrivateForm({ ...privateForm, interest_rate_percent: e.target.value })}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Agreed Due Date (Optional)</Label>
                  <Input
                    type="date"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                    value={privateForm.due_date}
                    onChange={(e) => setPrivateForm({ ...privateForm, due_date: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-teal-900 font-bold">Total Amount to Return:</span>
                <div className="text-base sm:text-lg font-black text-teal-800">
                  {formatCurrency(livePrivateCalculation.totalPayable)}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                {privateForm.interest_type === "zero_interest" ? (
                  <Badge variant="outline" className="border-teal-300 text-teal-700 bg-white">
                    0% Zero Interest Loan
                  </Badge>
                ) : (
                  <span>Includes {formatCurrency(livePrivateCalculation.totalInterest)} interest</span>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Notes / Borrowing Agreement Remarks</Label>
              <Input
                placeholder="e.g. Friendly advance for lab setup, to be returned in 6 months"
                className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
                value={privateForm.notes}
                onChange={(e) => setPrivateForm({ ...privateForm, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setAddPrivateLenderOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePrivateLender}
              disabled={submitting}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-teal-600/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Private Inflow"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: RECORD REPAYMENT / INSTALLMENT                   */}
      {/* ======================================================== */}
      <Dialog open={repaymentModalOpen} onOpenChange={setRepaymentModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              Record Repayment / Installment
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              Pay back a loan or return funds to lender: {selectedLoan?.lender_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-3.5 py-2">
              {/* Balance Banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Outstanding Balance:</span>
                  <div className="font-extrabold text-rose-600 text-base">
                    {formatCurrency(selectedLoan.remaining_balance)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium">Already Repaid:</span>
                  <div className="font-extrabold text-emerald-600 text-base">
                    {formatCurrency(selectedLoan.amount_repaid)}
                  </div>
                </div>
              </div>

              {/* Amount to Repay */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Repayment Amount (₹) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                    value={repaymentForm.amount}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Payment Date <span className="text-rose-500">*</span></Label>
                  <Input
                    type="date"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold"
                    value={repaymentForm.payment_date}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, payment_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs sm:text-sm">Payment Mode <span className="text-rose-500">*</span></Label>
                  <Select
                    value={repaymentForm.payment_method}
                    onValueChange={(val) => setRepaymentForm({ ...repaymentForm, payment_method: val })}
                  >
                    <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Wire / IMPS / NEFT</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cheque">Bank Cheque</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reference */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Transaction / Cheque Ref No.</Label>
                <Input
                  placeholder="e.g. UTR-98274618 / CHQ-1049"
                  className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                  value={repaymentForm.payment_reference}
                  onChange={(e) => setRepaymentForm({ ...repaymentForm, payment_reference: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Notes</Label>
                <Input
                  placeholder="e.g. EMI installment 4 of 36"
                  className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
                  value={repaymentForm.notes}
                  onChange={(e) => setRepaymentForm({ ...repaymentForm, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              disabled={repaying}
              onClick={() => setRepaymentModalOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordRepayment}
              disabled={repaying}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[140px] text-xs sm:text-sm shadow-md shadow-emerald-600/20"
            >
              {repaying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </span>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 4: REPAYMENT HISTORY VIEWER                        */}
      {/* ======================================================== */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-slate-200">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600 shrink-0" />
              Repayments Log: {selectedLoan?.lender_name}
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
              All installment records paid towards this borrowing.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Original Principal:</span>
                  <div className="font-bold text-slate-900">{formatCurrency(selectedLoan.principal_amount)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Payable:</span>
                  <div className="font-bold text-slate-900">{formatCurrency(selectedLoan.total_payable)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Repaid:</span>
                  <div className="font-bold text-emerald-600">{formatCurrency(selectedLoan.amount_repaid)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Balance Remaining:</span>
                  <div className="font-bold text-rose-600">{formatCurrency(selectedLoan.remaining_balance)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900">Installment History:</span>
                {!selectedLoan.repayments || selectedLoan.repayments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl">
                    No installments have been logged yet for this borrowing.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedLoan.repayments.map((rp: any) => (
                      <div key={rp.id} className="p-3 text-xs flex justify-between items-center bg-white hover:bg-slate-50/50">
                        <div>
                          <div className="font-bold text-slate-900">{formatCurrency(rp.amount)}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(rp.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            <span> · {rp.payment_method}</span>
                            {rp.payment_reference && <span> (Ref: {rp.payment_reference})</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {rp.notes && (
                            <span className="text-[11px] text-slate-500 max-w-[150px] truncate">{rp.notes}</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRepaymentReceipt(rp, selectedLoan)}
                            className="h-7 px-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-[11px] gap-1 rounded-lg"
                            title="Print Repayment Voucher"
                          >
                            <Printer className="h-3 w-3" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHistoryModalOpen(false)}
              className="w-full sm:w-auto rounded-xl h-10 font-semibold text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Capital & Repayment Receipt / Voucher Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        data={receiptData}
      />
    </div>
  );
}
