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
import { useDebounce } from "@/lib/use-debounce";
import {
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  FileSpreadsheet,
  UserCheck,
  Loader2,
  RotateCw,
  Sparkles,
  Tag,
  Landmark,
  Printer,
  Pencil,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";
import { subscribeToDataRefresh } from "@/lib/refresh-event";
import { cn } from "@/lib/utils";
import { ReceiptModal, ReceiptData } from "@/components/finance/receipt-modal";

const PRESET_EXPENSE_CATEGORIES = [
  "Salary",
  "Rent",
  "Utility",
  "Maintenance",
  "Equipment",
  "Marketing",
  "Office Supplies",
  "Study Materials & Printing",
  "Software & Internet",
  "Hospital & Affiliation",
  "Taxes & Legal",
];

const PRESET_INCOME_CATEGORIES = [
  "Course Fee",
  "Admission Fee",
  "Mock Test / Exam Fee",
  "Study Materials & Books",
  "Hostel / Accommodation",
  "Sponsorship / Grant",
  "Consulting & Workshops",
];

export default function AccountantTransactionsPage() {
  const { toast } = useToast();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [staffList, setStaffList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Edit Transaction State
  const [editOpen, setEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    type: "expense",
    category: "Utility",
    amount: "",
    description: "",
    reference_no: "",
    date: new Date().toISOString().split("T")[0],
    recipient_id: "",
  });
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    category: "Utility",
    amount: "",
    description: "",
    reference_no: "",
    date: new Date().toISOString().split("T")[0],
    recipient_id: "",
  });

  // Extract all unique categories present in the current ledger
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    txs.forEach((t) => {
      if (t.category && typeof t.category === "string") {
        const trimmed = t.category.trim();
        if (trimmed && trimmed !== "Other" && trimmed !== "+ Add Custom Category...") {
          set.add(trimmed);
        }
      }
    });
    return Array.from(set);
  }, [txs]);

  // Combined options for the dialog category dropdown
  const activeDropdownCategories = useMemo(() => {
    const baseList = form.type === "income" ? PRESET_INCOME_CATEGORIES : PRESET_EXPENSE_CATEGORIES;
    const merged = new Set([...baseList, ...dynamicCategories]);
    merged.delete("Other");
    return [...Array.from(merged), "Other", "+ Add Custom Category..."];
  }, [form.type, dynamicCategories]);

  // Combined options for the ledger table filter dropdown
  const allFilterCategories = useMemo(() => {
    const merged = new Set([
      ...PRESET_EXPENSE_CATEGORIES,
      ...PRESET_INCOME_CATEGORIES,
      ...dynamicCategories,
      "Other",
    ]);
    return Array.from(merged);
  }, [dynamicCategories]);

  const handleTypeChange = (newType: "income" | "expense") => {
    setIsCustomCategory(false);
    setCustomCategory("");
    setForm((prev) => ({
      ...prev,
      type: newType,
      category: newType === "income" ? "Course Fee" : "Utility",
      recipient_id: "",
    }));
  };

  const handleCategoryChange = (val: string) => {
    if (val === "+ Add Custom Category..." || val === "Other") {
      setIsCustomCategory(true);
      setForm((prev) => ({
        ...prev,
        category: val,
        recipient_id: "",
      }));
    } else {
      setIsCustomCategory(false);
      setCustomCategory("");
      setForm((prev) => ({
        ...prev,
        category: val,
        recipient_id: val === "Salary" ? prev.recipient_id : "",
      }));
    }
  };

  const handleOpenReceipt = (tx: any) => {
    const isIncome = tx.type === "income";
    const isSalary = tx.category === "Salary";

    let title = "Official Inflow Receipt";
    if (!isIncome) {
      title = isSalary ? "Salary Payment Voucher" : "Official Expense Voucher";
    }

    let partyName = "Beneficiary / Payee";
    let partyRoleOrCourse: string | undefined = undefined;
    let partyContact: string | undefined = undefined;

    if (tx.recipient_profile) {
      partyName = tx.recipient_profile.full_name;
      partyRoleOrCourse = `${tx.recipient_profile.role?.toUpperCase() || "Staff"} · AIMS Academy`;
      partyContact = tx.recipient_profile.email;
    } else if (isIncome) {
      partyName = "Student / Payer";
      partyRoleOrCourse = tx.category;
    }

    const cleanId = tx.id ? tx.id.replace(/-/g, "").slice(0, 8).toUpperCase() : String(Math.floor(100000 + Math.random() * 900000));
    const receiptNo = `AIMS-${isIncome ? "REC" : "VCH"}-${cleanId}`;

    const data: ReceiptData = {
      receiptNo,
      date: tx.date || new Date(),
      type: isIncome ? "income" : "expense",
      title,
      partyName,
      partyRoleOrCourse,
      partyContact,
      category: tx.category || "General",
      amount: Number(tx.amount) || 0,
      paymentMethod: tx.reference_no
        ? (tx.reference_no.toLowerCase().includes("upi")
            ? "UPI Online"
            : tx.reference_no.toLowerCase().includes("chq")
            ? "Cheque"
            : "Bank Transfer / Online")
        : "Cash / Direct Ledger",
      referenceNo: tx.reference_no || undefined,
      description: tx.description || `${tx.category} transaction recorded in AIMS ledger`,
      recordedBy: tx.recorded_by_profile?.full_name || "AIMS Accounts Dept",
      verifiedBy: "AIMS Accounts Salipur",
      status: "Verified & Recorded",
    };

    setReceiptData(data);
    setReceiptOpen(true);
  };

  const debouncedSearch = useDebounce(searchTerm, 350);

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (typeFilter !== "all") queryParams.append("type", typeFilter);
      if (categoryFilter !== "all") queryParams.append("category", categoryFilter);
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const response = await fetch(`/api/accountant/transactions?${queryParams.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTxs(data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching transactions",
        description: "Failed to connect to the operational ledger.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await fetch("/api/accountant/staff");
      const data = await response.json();
      if (Array.isArray(data)) {
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff list:", err);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const response = await fetch("/api/accountant/students");
      const data = await response.json();
      if (Array.isArray(data)) {
        setStudentsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch students list:", err);
    }
  };

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditForm({
      id: tx.id,
      type: tx.type || "expense",
      category: tx.category || "General",
      amount: String(tx.amount || ""),
      description: tx.description || "",
      reference_no: tx.reference_no || "",
      date: tx.date ? new Date(tx.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      recipient_id: tx.recipient_id || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (updating || !editForm.id) return;
    if (!editForm.amount || !editForm.description || !editForm.category) {
      toast({
        title: "Missing fields",
        description: "Please specify amount, category, and description.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/accountant/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Update failed",
          description: getFriendlyErrorMessage(data.error || "Unable to update transaction."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transaction updated ✅",
          description: "Transaction details updated successfully.",
          variant: "success",
        });
        setEditOpen(false);
        fetchTransactions();
      }
    } catch (err: any) {
      toast({
        title: "Error updating",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStaffList();
    fetchStudentsList();
  }, [typeFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchTransactions();
      fetchStaffList();
      fetchStudentsList();
    });
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTransactions(), fetchStaffList(), fetchStudentsList()]);
      toast({
        title: "Transactions Updated ✅",
        description: "Latest ledger records loaded.",
        variant: "success",
      });
    } catch {
      // silently handled
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleCreate = async () => {
    if (submitting) return;

    const isCustom = isCustomCategory || form.category === "+ Add New Category..." || form.category === "Other";
    const finalCategory = isCustom ? customCategory.trim() : form.category.trim();

    if (!form.amount || !form.description || !finalCategory) {
      toast({
        title: "Missing fields",
        description: isCustom && !finalCategory ? "Please specify your custom category name." : "Please enter an amount, category, and description.",
        variant: "destructive",
      });
      return;
    }

    if (finalCategory === "Salary" && !form.recipient_id) {
      toast({
        title: "Staff selection required",
        description: "Please select which staff or admin member is receiving this salary.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/accountant/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: finalCategory,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // Fallback for non-JSON or HTML response
      }

      if (!response.ok || data.error) {
        toast({
          title: "Could not save transaction",
          description: getFriendlyErrorMessage(data.error || "Unable to save transaction at this time."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transaction logged ✅",
          description: `Logged ₹${Number(form.amount).toLocaleString("en-IN")} under ${finalCategory}.`,
          variant: "success",
        });
        setAddOpen(false);
        fetchTransactions();
        setForm({
          type: "expense",
          category: "Utility",
          amount: "",
          description: "",
          reference_no: "",
          date: new Date().toISOString().split("T")[0],
          recipient_id: "",
        });
        setCustomCategory("");
        setIsCustomCategory(false);
      }
    } catch (err: any) {
      toast({
        title: "Could not save transaction",
        description: getFriendlyErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Are you sure you want to delete this transaction record? This action is permanent.")) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/accountant/transactions?id=${id}`, {
        method: "DELETE",
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || data.error) {
        toast({
          title: "Failed to delete record",
          description: getFriendlyErrorMessage(data.error || "Unable to delete transaction record."),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Record deleted",
          description: "Transaction has been permanently removed.",
          variant: "success",
        });
        fetchTransactions();
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

  // Financial snapshot metrics
  const stats = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    txs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") {
        inflow += amt;
      } else {
        outflow += amt;
      }
    });
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: txs.length,
    };
  }, [txs]);

  // Clean parser for ledger entries (splits long raw fee descriptions into student, course, roll, note)
  const parseRecord = (tx: any) => {
    const desc = (tx.description || "").trim();
    const cat = (tx.category || "").trim();

    if (/^fee received from/i.test(desc)) {
      const fromIdx = desc.toLowerCase().indexOf("fee received from ");
      const forIdx = desc.toLowerCase().indexOf(" for ", fromIdx);

      let studentName = "";
      let remainder = "";

      if (forIdx > -1) {
        studentName = desc.substring(fromIdx + 18, forIdx).trim();
        remainder = desc.substring(forIdx + 5).trim();
      } else {
        studentName = desc.substring(fromIdx + 18).trim();
      }

      let courseName = "";
      let rollNo = "";
      let note = "";

      const parenOpen = remainder.indexOf("(");
      const parenClose = remainder.lastIndexOf(")");

      if (parenOpen > -1 && parenClose > parenOpen) {
        courseName = remainder.substring(0, parenOpen).trim();
        const details = remainder.substring(parenOpen + 1, parenClose);

        const parts = details.split("|").map((p) => p.trim());
        for (const part of parts) {
          if (/^roll:\s*/i.test(part)) {
            rollNo = part.replace(/^roll:\s*/i, "").trim();
          } else if (/^note:\s*/i.test(part)) {
            note = part.replace(/^note:\s*/i, "").trim();
          } else if (!rollNo && /AIMS-[A-Z0-9\/-]+/i.test(part)) {
            rollNo = part;
          } else if (!note && !/^guardian:/i.test(part) && !/^address:/i.test(part) && part) {
            note = part;
          }
        }
      } else {
        courseName = remainder;
      }

      if (studentName && courseName.toLowerCase().endsWith(studentName.toLowerCase())) {
        courseName = courseName.slice(0, -studentName.length).trim();
      }

      return {
        isStudentFee: true,
        title: studentName || "Student Fee",
        subtitle: courseName || "AIMS Coaching Program",
        rollNo,
        note,
        rawDesc: desc,
      };
    }

    if (/^capital inflow:/i.test(desc)) {
      return {
        isStudentFee: false,
        title: desc,
        subtitle: cat || "Capital / Private Borrowing",
        rollNo: "",
        note: "",
        rawDesc: desc,
      };
    }

    return {
      isStudentFee: false,
      title: desc,
      subtitle: tx.recipient_profile ? `Paid to: ${tx.recipient_profile.full_name}` : "",
      rollNo: "",
      note: "",
      rawDesc: desc,
    };
  };

  const getCategoryBadgeClass = (category: string, type: string) => {
    const c = (category || "").toLowerCase();
    if (type === "income" || c.includes("fee") || c.includes("capital")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (c.includes("salary")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (c.includes("asset") || c.includes("furniture") || c.includes("equipment")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (c.includes("marketing")) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Ledger & Transactions 💸
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-semibold">
            Track operational costs, salaries, and course revenue logs.
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
            title="Refresh Transactions (without page reload)"
          >
            <RotateCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3 sm:px-4 rounded-xl font-bold border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 transition-all shadow-xs"
          >
            <Link href="/accountant/capital">
              <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Capital & Loans</span>
              <span className="sm:hidden">Loans</span>
            </Link>
          </Button>
          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);
              if (!open) {
                setIsCustomCategory(false);
                setCustomCategory("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white border-0 font-bold rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-slate-200">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                  Record Operational Entry
                </DialogTitle>
                <DialogDescription className="font-semibold text-slate-500 text-xs sm:text-sm">
                  Log an income, expense, salary, or add a custom ledger category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 sm:space-y-4 py-2 sm:py-3">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={form.type === "income" ? "primary" : "outline"}
                    className={cn(
                      "h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm transition-all",
                      form.type === "income"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 border-emerald-600"
                        : "border-slate-200 text-slate-700"
                    )}
                    onClick={() => handleTypeChange("income")}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Income (Inflow)
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === "expense" ? "primary" : "outline"}
                    className={cn(
                      "h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm transition-all",
                      form.type === "expense"
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 border-rose-600"
                        : "border-slate-200 text-slate-700"
                    )}
                    onClick={() => handleTypeChange("expense")}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-1 text-rose-500" />
                    Expense (Outflow)
                  </Button>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-xs sm:text-sm">
                      Category {form.type === "income" ? "(Inflow type)" : "(Expense type)"} <span className="text-rose-500">*</span>
                    </Label>
                    {isCustomCategory && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Custom mode active
                      </span>
                    )}
                  </div>
                  <Select
                    value={form.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="h-10 sm:h-11 rounded-xl font-semibold text-xs sm:text-sm">
                      <SelectValue placeholder="Select or add category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {activeDropdownCategories.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className={cn(
                            c === "+ Add New Category..." && "text-indigo-600 font-bold bg-indigo-50/60 focus:bg-indigo-100"
                          )}
                        >
                          {c === "+ Add New Category..." ? (
                            <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                              <Sparkles className="h-3.5 w-3.5" />
                              + Add New Category...
                            </span>
                          ) : (
                            c
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Category Input if active or "+ Add New Category..." or "Other" selected */}
                {(isCustomCategory || form.category === "+ Add New Category..." || form.category === "Other") && (
                  <div className="space-y-1.5 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-indigo-600" />
                        Enter New Category Name <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    </div>
                    <Input
                      placeholder={form.type === "expense" ? "e.g. Generator Fuel, Student Uniforms, Lab Upgrades..." : "e.g. Workshop Tickets, Library Deposit, Certificate Fee..."}
                      className="h-10 sm:h-11 rounded-xl bg-white border-indigo-200 focus:ring-indigo-500 font-semibold text-slate-800 text-xs sm:text-sm"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      This custom category will be saved to your ledger and automatically appear in future options and filters.
                    </p>
                  </div>
                )}

                {/* Recipient Selection for Salary */}
                {form.category === "Salary" && (
                  <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs sm:text-sm">
                        <UserCheck className="h-4 w-4 text-indigo-600" />
                        Paid To (Staff / Admin) *
                      </Label>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    </div>
                    <Select
                      value={form.recipient_id}
                      onValueChange={(val) => {
                        const selected = staffList.find((s) => s.id === val);
                        setForm((prev) => {
                          const autoDesc = selected
                            ? `Salary paid to ${selected.full_name} (${selected.roles?.join(", ") || selected.primaryRole})`
                            : prev.description;
                          return {
                            ...prev,
                            recipient_id: val,
                            description:
                              !prev.description || prev.description.startsWith("Salary paid to")
                                ? autoDesc
                                : prev.description,
                          };
                        });
                      }}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl bg-white border-indigo-200 focus:ring-indigo-500 font-semibold text-slate-800 text-xs sm:text-sm">
                        <SelectValue placeholder="Select staff or admin member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">Loading staff members...</div>
                        ) : (
                          staffList.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              <div className="flex items-center gap-2 py-0.5">
                                <span className="font-bold text-slate-900">{staff.full_name}</span>
                                <Badge variant="outline" className="text-[10px] uppercase font-extrabold px-1.5 py-0 border-indigo-200 bg-indigo-50 text-indigo-700">
                                  {staff.roles?.join(", ") || staff.primaryRole}
                                </Badge>
                                <span className="text-slate-400 text-xs hidden sm:inline">({staff.email})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.type === "income" && (form.category === "Course Fee" || form.category === "Admission Fee" || form.category.toLowerCase().includes("fee")) && (
                  <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        Attributed Student (Optional)
                      </Label>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Syncs to Student Fees
                      </span>
                    </div>
                    <Select
                      value={form.recipient_id}
                      onValueChange={(val) => {
                        const selected = studentsList.find((s) => s.id === val);
                        setForm((prev) => {
                          const autoDesc = selected
                            ? `Fee payment from ${selected.full_name} (${selected.course_of_interest || "AIMS Student"})`
                            : prev.description;
                          return {
                            ...prev,
                            recipient_id: val,
                            description:
                              !prev.description || prev.description.startsWith("Fee payment from")
                                ? autoDesc
                                : prev.description,
                          };
                        });
                      }}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl bg-white border-emerald-200 focus:ring-emerald-500 font-semibold text-slate-800 text-xs sm:text-sm">
                        <SelectValue placeholder="Select student to sync to Student Fees..." />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsList.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">Loading students...</div>
                        ) : (
                          studentsList.map((stud) => (
                            <SelectItem key={stud.id} value={stud.id}>
                              <div className="flex items-center gap-2 py-0.5">
                                <span className="font-bold text-slate-900">{stud.full_name}</span>
                                <span className="text-slate-400 text-xs hidden sm:inline">({stud.email})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Amount & Date - responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Amount input */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-semibold text-xs sm:text-sm">Amount (₹) <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        className="pl-8 h-10 sm:h-11 rounded-xl font-bold text-slate-900 text-xs sm:text-sm"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Date input */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-semibold text-xs sm:text-sm">Date <span className="text-rose-500">*</span></Label>
                    <Input
                      type="date"
                      className="h-10 sm:h-11 rounded-xl font-semibold text-xs sm:text-sm"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Ref inputs */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">Reference No. (Optional)</Label>
                  <Input
                    placeholder="e.g. TXN-987452 / CHQ-1002 / UPI"
                    className="h-10 sm:h-11 rounded-xl font-mono text-xs sm:text-sm"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-semibold text-xs sm:text-sm">Description <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="e.g. Paid Office Rent for August 2026"
                    className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setAddOpen(false)}
                  className="w-full sm:w-auto rounded-xl h-10 sm:h-11 font-semibold text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-xl h-10 sm:h-11 font-bold min-w-[130px] text-xs sm:text-sm shadow-md shadow-indigo-600/20"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Log Entry"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Snapshot Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Inflow */}
        <Card className="border-slate-100 shadow-xs bg-gradient-to-br from-emerald-50/70 via-white to-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
                Total Inflow
              </span>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-base sm:text-xl lg:text-2xl font-black text-emerald-700 tracking-tight">
                +{formatCurrency(stats.inflow)}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Course fees & capital inflows
            </p>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="border-slate-100 shadow-xs bg-gradient-to-br from-rose-50/70 via-white to-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-800">
                Total Outflow
              </span>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-base sm:text-xl lg:text-2xl font-black text-rose-700 tracking-tight">
                -{formatCurrency(stats.outflow)}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Salaries, assets & expenses
            </p>
          </CardContent>
        </Card>

        {/* Net Cash Balance */}
        <Card className="border-slate-100 shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-800">
                Net Cash Balance
              </span>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className={cn(
                "text-base sm:text-xl lg:text-2xl font-black tracking-tight",
                stats.net >= 0 ? "text-indigo-900" : "text-rose-700"
              )}>
                {stats.net >= 0 ? "+" : ""}{formatCurrency(stats.net)}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Net ledger position
            </p>
          </CardContent>
        </Card>

        {/* Total Records */}
        <Card className="border-slate-100 shadow-xs bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
                Total Records
              </span>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                {stats.count}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Active ledger entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Ledger Table */}
      <Card className="border-slate-100 overflow-hidden bg-white shadow-xs">
        <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-slate-100 flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="md:max-w-md flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search description, student, staff..."
                className="pl-10 h-10 sm:h-11 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50/50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 sm:h-11 w-full sm:w-36 rounded-xl gap-1.5 text-xs sm:text-sm font-semibold">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder="All Entry Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Inflow (Incomes)</SelectItem>
                <SelectItem value="expense">Outflow (Expenses)</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 sm:h-11 w-full sm:w-44 rounded-xl gap-1.5 text-xs sm:text-sm font-semibold">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">All Categories</SelectItem>
                {allFilterCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Ledger List */}
        <div className="p-0">
          {loading ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              Fetching entries...
            </div>
          ) : txs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm">
              No operational entries logged matching criteria.
            </div>
          ) : (
            <>
              {/* Mobile View: Clean Card Layout (< md screens) */}
              <div className="block md:hidden space-y-3 p-3 bg-slate-50/40">
                {txs.map((tx: any) => {
                  const parsed = parseRecord(tx);
                  const isIncome = tx.type === "income";

                  return (
                    <div
                      key={tx.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shadow-xs hover:border-indigo-200 transition-all"
                    >
                      {/* Top Header: Date, Category badge, Amount */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">
                            {new Date(tx.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize border",
                              getCategoryBadgeClass(tx.category, tx.type)
                            )}
                          >
                            {tx.category || "General"}
                          </Badge>
                        </div>
                        <div
                          className={cn(
                            "text-sm font-black whitespace-nowrap",
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                        </div>
                      </div>

                      {/* Main Description details */}
                      <div className="space-y-1">
                        {parsed.isStudentFee ? (
                          <>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                              <span className="truncate">{parsed.title}</span>
                            </div>
                            <div className="text-xs font-semibold text-indigo-700">
                              {parsed.subtitle}
                            </div>
                            {(parsed.rollNo || parsed.note) && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {parsed.rollNo && (
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-50 font-mono text-[10px] text-slate-600 border-slate-200"
                                  >
                                    Roll: {parsed.rollNo}
                                  </Badge>
                                )}
                                {parsed.note && (
                                  <span className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                    "{parsed.note}"
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-900 text-sm">
                              {parsed.title}
                            </div>
                            {parsed.subtitle && (
                              <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                                <UserCheck className="h-3 w-3 shrink-0" />
                                <span>{parsed.subtitle}</span>
                              </div>
                            )}
                          </>
                        )}

                        {tx.reference_no && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Ref: {tx.reference_no}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer - Always visible, never cut off */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReceipt(tx)}
                          className="h-8 px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-xs gap-1 rounded-xl"
                        >
                          <Printer className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Receipt</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(tx)}
                          className="h-8 px-2.5 text-amber-700 border-amber-200 hover:bg-amber-50 font-bold text-xs gap-1 rounded-xl"
                        >
                          <Pencil className="h-3.5 w-3.5 text-amber-600" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === tx.id}
                          onClick={() => handleDelete(tx.id)}
                          className="h-8 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs gap-1 rounded-xl"
                        >
                          {deletingId === tx.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Ledger Table with Fixed/Sticky Actions column */}
              <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] sm:text-[10px] font-bold tracking-wider bg-slate-50/70">
                      <th className="py-3 px-3 sm:px-4 w-[85px] sm:w-[95px] shrink-0">Date</th>
                      <th className="py-3 px-3 sm:px-4 min-w-[240px]">Description & Particulars</th>
                      <th className="py-3 px-3 sm:px-4 w-[120px] lg:w-[140px]">Category</th>
                      <th className="py-3 px-3 sm:px-4 w-[100px] lg:w-[120px]">Reference</th>
                      <th className="py-3 px-3 sm:px-4 text-right w-[100px] lg:w-[120px]">Amount</th>
                      <th className="py-3 px-3 sm:px-4 text-center w-[120px] shrink-0 sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                    {txs.map((tx: any) => {
                      const parsed = parseRecord(tx);
                      const isIncome = tx.type === "income";

                      return (
                        <tr key={tx.id} className="group hover:bg-slate-50/60 transition-colors">
                          {/* Date */}
                          <td className="py-3 px-3 sm:px-4 font-medium text-slate-500 text-[11px] sm:text-xs whitespace-nowrap align-middle">
                            {new Date(tx.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>

                          {/* Description & Particulars */}
                          <td className="py-3 px-3 sm:px-4 align-middle">
                            <div className="flex flex-col gap-0.5">
                              {parsed.isStudentFee ? (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <GraduationCap className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                    <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
                                      {parsed.title}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-indigo-700">
                                    {parsed.subtitle}
                                  </span>
                                  {(parsed.rollNo || parsed.note) && (
                                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                      {parsed.rollNo && (
                                        <Badge
                                          variant="outline"
                                          className="bg-slate-50 font-mono text-[9px] text-slate-600 border-slate-200 py-0 px-1.5"
                                        >
                                          Roll: {parsed.rollNo}
                                        </Badge>
                                      )}
                                      {parsed.note && (
                                        <span className="text-[10px] text-slate-500 italic bg-slate-50 px-1.5 py-0.2 rounded border border-slate-100">
                                          "{parsed.note}"
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="text-slate-900 font-bold text-xs sm:text-sm">
                                    {parsed.title}
                                  </span>
                                  {parsed.subtitle && (
                                    <span className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                                      <UserCheck className="h-3 w-3 shrink-0" />
                                      {parsed.subtitle}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 sm:px-4 align-middle">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize text-[10px] sm:text-xs font-bold py-0.5 px-2 truncate max-w-[130px] inline-block",
                                getCategoryBadgeClass(tx.category, tx.type)
                              )}
                            >
                              {tx.category || "General"}
                            </Badge>
                          </td>

                          {/* Reference */}
                          <td className="py-3 px-3 sm:px-4 text-slate-500 font-mono text-[10px] sm:text-xs truncate align-middle">
                            {tx.reference_no ? (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                                {tx.reference_no}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Amount */}
                          <td
                            className={cn(
                              "py-3 px-3 sm:px-4 text-right font-black text-xs sm:text-sm whitespace-nowrap align-middle",
                              isIncome ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                          </td>

                          {/* Actions: Sticky to right side so it never disappears on any screen */}
                          <td className="py-3 px-3 sm:px-4 text-center align-middle shrink-0 sticky right-0 bg-white/95 group-hover:bg-slate-50/95 backdrop-blur-xs transition-colors shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenReceipt(tx)}
                                className="h-7 w-7 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg shrink-0"
                                title="Print / Share Official Receipt"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(tx)}
                                className="h-7 w-7 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg shrink-0"
                                title="Edit transaction"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingId === tx.id}
                                onClick={() => handleDelete(tx.id)}
                                className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg disabled:opacity-50 shrink-0"
                                title="Delete entry"
                              >
                                {deletingId === tx.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
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
            </>
          )}
        </div>
      </Card>

      {/* Edit Transaction Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-2xl p-4 sm:p-6 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Pencil className="h-5 w-5 text-indigo-600" />
              Edit Transaction
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500">
              Update details of this financial entry in the AIMS ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setEditForm((prev) => ({ ...prev, type: "income" }))}
                className={cn(
                  "py-2 text-xs sm:text-sm font-bold rounded-lg transition-all",
                  editForm.type === "income" ? "bg-white text-emerald-700 shadow-xs font-black" : "text-slate-500"
                )}
              >
                + Income
              </button>
              <button
                type="button"
                onClick={() => setEditForm((prev) => ({ ...prev, type: "expense" }))}
                className={cn(
                  "py-2 text-xs sm:text-sm font-bold rounded-lg transition-all",
                  editForm.type === "expense" ? "bg-white text-rose-700 shadow-xs font-black" : "text-slate-500"
                )}
              >
                - Expense
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Category</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Category"
                className="h-10 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Amount (₹)</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="h-10 rounded-xl font-bold text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs sm:text-sm">Date</Label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-10 rounded-xl font-semibold text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Reference No. (Optional)</Label>
              <Input
                value={editForm.reference_no}
                onChange={(e) => setEditForm((prev) => ({ ...prev, reference_no: e.target.value }))}
                placeholder="UPI / Cheque / Ref"
                className="h-10 rounded-xl font-mono text-xs sm:text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs sm:text-sm">Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description of transaction"
                className="h-10 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Receipt / Voucher Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        data={receiptData}
      />
    </div>
  );
}
