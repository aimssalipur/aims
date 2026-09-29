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
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

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

  useEffect(() => {
    fetchTransactions();
    fetchStaffList();
  }, [typeFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    return subscribeToDataRefresh(() => {
      fetchTransactions();
      fetchStaffList();
    });
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTransactions(), fetchStaffList()]);
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

      {/* Filter and Ledger Table */}
      <Card className="border-slate-100 overflow-hidden bg-white">
        <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-slate-100 flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="md:max-w-md flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search description..."
                className="pl-10 h-10 sm:h-12 text-xs sm:text-sm font-semibold rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 sm:h-11 w-full sm:w-40 rounded-xl gap-1.5 text-xs sm:text-sm font-semibold">
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
            <div className="p-8 sm:p-12 text-center text-slate-400 font-semibold text-xs sm:text-sm">No operational entries logged matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] sm:text-[10px] font-bold tracking-wider bg-slate-50/50">
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6">Date</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6">Description</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6">Category</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6">Reference / Ref</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6">Recorded By</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6 text-right">Amount</th>
                    <th className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                  {txs.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 font-medium text-slate-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-900 font-bold truncate">{tx.description}</span>
                          {tx.recipient_profile && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-100">
                                <UserCheck className="h-3 w-3 text-indigo-600 shrink-0" />
                                <span>Paid to: {tx.recipient_profile.full_name}</span>
                                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-200/70 text-indigo-900">
                                  {tx.recipient_profile.role}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6">
                        <Badge variant="outline" className="capitalize border-slate-200 py-0.5 sm:py-1 px-2 sm:px-2.5 text-[10px] sm:text-xs">
                          {tx.category}
                        </Badge>
                      </td>
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-slate-400 font-mono text-[10px] sm:text-xs whitespace-nowrap">{tx.reference_no || "N/A"}</td>
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-slate-500 font-normal whitespace-nowrap">
                        {tx.recorded_by_profile?.full_name || "System Log"}
                      </td>
                      <td className={`py-2.5 sm:py-4 px-3 sm:px-6 text-right font-extrabold text-xs sm:text-base whitespace-nowrap ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenReceipt(tx)}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg"
                            title="Print / Share Official Receipt"
                          >
                            <Printer className="h-3.5 w-3.5 sm:h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === tx.id}
                            onClick={() => handleDelete(tx.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg disabled:opacity-50"
                            title="Delete entry"
                          >
                            {deletingId === tx.id ? (
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 w-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      {/* Official Receipt / Voucher Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        data={receiptData}
      />
    </div>
  );
}
