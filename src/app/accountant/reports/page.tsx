"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Search,
  Copy,
  Check,
  Receipt,
  UserCheck,
  LayoutList,
  Table as TableIcon,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Wallet,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ReceiptModal, ReceiptData } from "@/components/finance/receipt-modal";
import { cn } from "@/lib/utils";

export default function AccountantReportsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Month Details Modal State
  const [selectedMonth, setSelectedMonth] = useState<any | null>(null);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthTypeFilter, setMonthTypeFilter] = useState<"all" | "expense" | "income">("expense");
  const [monthCategoryFilter, setMonthCategoryFilter] = useState("all");
  const [monthSearch, setMonthSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Voucher Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch("/api/accountant/summary", { cache: "no-store" });
      const summaryData = await summaryRes.json();
      if (summaryData.metrics) {
        setData(summaryData);
      }

      const txRes = await fetch("/api/accountant/transactions", { cache: "no-store" });
      const txData = await txRes.json();
      if (Array.isArray(txData)) {
        setTxs(txData);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching reports",
        description: "Failed to download financial summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCategoryBadgeClass = (category: string, type: string) => {
    if (type === "income") {
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    }
    const cat = (category || "").toLowerCase();
    if (cat.includes("salary")) return "bg-purple-50 text-purple-800 border-purple-200/80";
    if (cat.includes("rent")) return "bg-amber-50 text-amber-800 border-amber-200/80";
    if (cat.includes("utility")) return "bg-blue-50 text-blue-800 border-blue-200/80";
    if (cat.includes("tax") || cat.includes("legal")) return "bg-rose-50 text-rose-800 border-rose-200/80";
    if (cat.includes("hospital") || cat.includes("affiliation")) return "bg-cyan-50 text-cyan-800 border-cyan-200/80";
    if (cat.includes("marketing")) return "bg-pink-50 text-pink-800 border-pink-200/80";
    if (cat.includes("equipment") || cat.includes("maintenance")) return "bg-orange-50 text-orange-800 border-orange-200/80";
    return "bg-slate-100 text-slate-800 border-slate-200/80";
  };

  // Helper to match a transaction to a month object
  const isTxInMonth = (txDateStr: string, monthObj: any) => {
    if (!txDateStr || !monthObj) return false;
    const d = new Date(txDateStr);
    if (isNaN(d.getTime())) return false;

    if (monthObj.yearMonth) {
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (ym === monthObj.yearMonth) return true;
    }

    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return label.toLowerCase() === (monthObj.month || "").toLowerCase();
  };

  // Transactions belonging to the currently inspected month
  const currentMonthTransactions = useMemo(() => {
    if (!selectedMonth) return [];
    return txs
      .filter((t) => isTxInMonth(t.date, selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [txs, selectedMonth]);

  // Categories present in this month's transactions
  const monthCategories = useMemo(() => {
    const set = new Set<string>();
    currentMonthTransactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [currentMonthTransactions]);

  // Filtered transactions inside the modal
  const filteredMonthTransactions = useMemo(() => {
    return currentMonthTransactions.filter((t) => {
      if (monthTypeFilter !== "all" && t.type !== monthTypeFilter) {
        return false;
      }
      if (monthCategoryFilter !== "all" && t.category !== monthCategoryFilter) {
        return false;
      }
      if (monthSearch.trim()) {
        const q = monthSearch.toLowerCase();
        const descMatch = (t.description || "").toLowerCase().includes(q);
        const catMatch = (t.category || "").toLowerCase().includes(q);
        const refMatch = (t.reference_no || "").toLowerCase().includes(q);
        const recipientMatch = (t.recipient_profile?.full_name || "").toLowerCase().includes(q);
        if (!descMatch && !catMatch && !refMatch && !recipientMatch) {
          return false;
        }
      }
      return true;
    });
  }, [currentMonthTransactions, monthTypeFilter, monthCategoryFilter, monthSearch]);

  // Aggregated totals for the selected month
  const monthStats = useMemo(() => {
    let expenseTotal = 0;
    let incomeTotal = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    const categoryTotals: Record<string, { amount: number; count: number }> = {};

    currentMonthTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "expense") {
        expenseTotal += amt;
        expenseCount += 1;
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = { amount: 0, count: 0 };
        }
        categoryTotals[t.category].amount += amt;
        categoryTotals[t.category].count += 1;
      } else {
        incomeTotal += amt;
        incomeCount += 1;
      }
    });

    return {
      expenseTotal,
      incomeTotal,
      expenseCount,
      incomeCount,
      netMargin: incomeTotal - expenseTotal,
      categoryTotals,
    };
  }, [currentMonthTransactions]);

  const handleOpenMonthDetails = (monthItem: any) => {
    setSelectedMonth(monthItem);
    setMonthTypeFilter("expense"); // Focus on expenses first as requested
    setMonthCategoryFilter("all");
    setMonthSearch("");
    setViewMode("cards"); // Default to high-readability cards view
    setMonthModalOpen(true);
  };

  const handleCopyRef = (refNo: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(refNo);
    setCopiedRef(refNo);
    toast({ title: "Copied!", description: `Reference #${refNo} copied to clipboard.` });
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleViewReceipt = (t: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const formattedReceipt: ReceiptData = {
      receiptNo: t.reference_no || `VCH-${t.id.slice(0, 8).toUpperCase()}`,
      date: t.date,
      type: t.type === "income" ? "income" : "expense",
      title: t.type === "income" ? "Official Income Receipt" : "Payment & Expense Voucher",
      partyName:
        t.recipient_profile?.full_name ||
        (t.type === "income" ? "AIMS Cash Collection" : "General Vendor / Supplier"),
      partyRoleOrCourse: t.recipient_profile?.role ? `Designation: ${t.recipient_profile.role}` : undefined,
      partyContact: t.recipient_profile?.email,
      category: t.category,
      amount: Number(t.amount) || 0,
      paymentMethod: "Bank Transfer / Cash Voucher",
      referenceNo: t.reference_no,
      description: t.description,
      recordedBy: t.recorded_by_profile?.full_name || "AIMS Finance Desk",
      verifiedBy: "AIMS Administration",
      status: "Verified & Audited",
    };
    setReceiptData(formattedReceipt);
    setReceiptOpen(true);
  };

  const handleExportMonthCSV = () => {
    if (!selectedMonth || filteredMonthTransactions.length === 0) {
      toast({
        title: "No transactions",
        description: "No transactions available to export for this view.",
        variant: "destructive",
      });
      return;
    }

    const monthLabel = selectedMonth.fullMonth || selectedMonth.month;
    const headers = ["Date", "Type", "Category", "Description", "Recipient", "Reference No", "Amount (INR)"];
    const rows = filteredMonthTransactions.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.type.toUpperCase(),
      t.category,
      (t.description || "").replace(/"/g, '""'),
      (t.recipient_profile?.full_name || "").replace(/"/g, '""'),
      t.reference_no || "",
      t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIMS_Expenses_${monthLabel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete ✅",
      description: `Saved ${filteredMonthTransactions.length} transaction records for ${monthLabel}.`,
      variant: "success",
    });
  };

  const handleExportCSV = () => {
    if (txs.length === 0) {
      toast({
        title: "No records found",
        description: "There are no transactions to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Description", "Category", "Type", "Reference No", "Amount (INR)"];
    const rows = txs.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      (t.description || "").replace(/"/g, '""'),
      t.category,
      t.type,
      t.reference_no || "",
      t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AIMS_Financial_Ledger_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete ✅",
      description: "Complete financial ledger sheet saved successfully.",
      variant: "success",
    });
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="font-semibold text-slate-500">Generating report sheet...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1440px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Statements & Audits 📊
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
            Evaluate annual/monthly revenues, operational expenditures, and inspect itemized monthly sheets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportsData}
            disabled={loading}
            className="h-8 sm:h-9 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin text-aims-green" : "text-slate-600"}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={handleExportCSV}
            size="sm"
            className="gap-1.5 h-8 sm:h-9 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-0 text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics: Responsive 3-column micro-grid on mobile & desktop */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        <Card className="border-slate-100 bg-white shadow-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider truncate">
              Gross Inflow
            </span>
            <div className="h-6 w-6 sm:h-9 sm:w-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xs sm:text-xl md:text-2xl font-black text-slate-950 mt-1 truncate">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate hidden sm:block">
            Student fee verifications & offline income
          </p>
        </Card>

        <Card className="border-slate-100 bg-white shadow-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider truncate">
              Gross Outflow
            </span>
            <div className="h-6 w-6 sm:h-9 sm:w-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xs sm:text-xl md:text-2xl font-black text-rose-700 mt-1 truncate">
            {formatCurrency(metrics.totalExpenses)}
          </div>
          <p className="text-[10px] text-rose-600 font-medium mt-0.5 truncate hidden sm:block">
            Facility rent, vendor salaries & bills
          </p>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-xs uppercase font-extrabold text-slate-500 tracking-wider truncate">
              Net Capital
            </span>
            <div className="h-6 w-6 sm:h-9 sm:w-9 bg-indigo-100/80 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div
            className={cn(
              "text-xs sm:text-xl md:text-2xl font-black mt-1 truncate",
              metrics.netProfit >= 0 ? "text-indigo-600" : "text-amber-600"
            )}
          >
            {formatCurrency(metrics.netProfit)}
          </div>
          <p className="text-[10px] text-indigo-600 font-medium mt-0.5 truncate hidden sm:block">
            Net operational reserve status
          </p>
        </Card>
      </div>

      {/* Aggregate Report Sheets */}
      <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden rounded-xl sm:rounded-2xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-3.5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-aims-navy" />
              <span>Monthly Cash Reserve Flow Sheet</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Click any month row or &quot;Inspect Expenses&quot; to inspect itemized vouchers, salaries, and rent.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Inflow</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Outflow</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" /> Net Margin</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile View: Sleek, Ultra-Compact Banking List (< 768px) */}
          <div className="md:hidden divide-y divide-slate-100 bg-white">
            {data?.chartData?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No monthly cycles logged yet.
              </div>
            ) : (
              data?.chartData?.map((item: any) => {
                const margin = item.revenue - item.expenses;
                const monthExpenseCount =
                  item.expenseCount !== undefined
                    ? item.expenseCount
                    : txs.filter((t) => t.type === "expense" && isTxInMonth(t.date, item)).length;

                const monthIncomeCount =
                  item.incomeCount !== undefined
                    ? item.incomeCount
                    : txs.filter((t) => t.type === "income" && isTxInMonth(t.date, item)).length;

                const parts = (item.month || "").split(" ");
                const shortMonth = parts[0] || "---";
                const shortYear = parts[1] || "26";

                return (
                  <div
                    key={item.month}
                    onClick={() => handleOpenMonthDetails(item)}
                    className="p-2.5 sm:p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-2.5"
                  >
                    {/* Left: Month Calendar Icon + Inflow/Outflow Breakdown */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-9 w-9 rounded-lg bg-slate-100/90 border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-[8px] font-black uppercase text-slate-400 leading-none">
                          {shortMonth}
                        </span>
                        <span className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                          &apos;{shortYear}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1.5">
                          <span className="truncate">{item.fullMonth || item.month}</span>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                            ({monthExpenseCount} exp)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium flex-wrap">
                          <span className="text-emerald-600 font-bold">+{formatCurrency(item.revenue)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-rose-600 font-bold">-{formatCurrency(item.expenses)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Net Margin & Chevron */}
                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <div>
                        <div
                          className={cn(
                            "text-xs sm:text-sm font-black tracking-tight",
                            margin >= 0 ? "text-indigo-600" : "text-amber-700"
                          )}
                        >
                          {formatCurrency(margin)}
                        </div>
                        <span
                          className={cn(
                            "text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full inline-block mt-0.5",
                            margin >= 0
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60"
                          )}
                        >
                          {margin >= 0 ? "Surplus" : "Deficit"}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table: Hidden on Mobile (< 768px), Clean Spreadsheet on Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider bg-slate-50/70">
                  <th className="py-3.5 px-4 sm:px-6">Month Cycle</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Inflow (Revenue)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Outflow (Expense)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Net Margin</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                {data?.chartData?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No monthly cycles logged yet.
                    </td>
                  </tr>
                ) : (
                  data?.chartData?.map((item: any) => {
                    const margin = item.revenue - item.expenses;
                    const monthExpenseCount =
                      item.expenseCount !== undefined
                        ? item.expenseCount
                        : txs.filter((t) => t.type === "expense" && isTxInMonth(t.date, item)).length;

                    const monthIncomeCount =
                      item.incomeCount !== undefined
                        ? item.incomeCount
                        : txs.filter((t) => t.type === "income" && isTxInMonth(t.date, item)).length;

                    return (
                      <tr
                        key={item.month}
                        onClick={() => handleOpenMonthDetails(item)}
                        className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-extrabold text-slate-900 group-hover:text-aims-navy transition-colors flex items-center gap-2">
                            <span>{item.fullMonth || item.month}</span>
                            <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 bg-slate-50">
                              {item.month}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {monthExpenseCount} expenses · {monthIncomeCount} revenues
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="font-extrabold text-emerald-600 text-sm sm:text-base">
                            {formatCurrency(item.revenue)}
                          </div>
                          {monthIncomeCount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {monthIncomeCount} {monthIncomeCount === 1 ? "entry" : "entries"}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="font-extrabold text-rose-600 text-sm sm:text-base">
                            {formatCurrency(item.expenses)}
                          </div>
                          {monthExpenseCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 mt-0.5">
                              <TrendingDown className="h-2.5 w-2.5" />
                              {monthExpenseCount} {monthExpenseCount === 1 ? "expense" : "expenses"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">0 expenses</span>
                          )}
                        </td>

                        <td
                          className={`py-4 px-4 sm:px-6 text-right font-extrabold text-sm sm:text-base ${
                            margin >= 0 ? "text-indigo-600" : "text-amber-600"
                          }`}
                        >
                          <div>{formatCurrency(margin)}</div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              margin >= 0
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {margin >= 0 ? "Surplus" : "Deficit"}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenMonthDetails(item)}
                            className="h-8 gap-1.5 text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-800 shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-rose-600" />
                            <span>Inspect Expenses</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAILED MONTHLY EXPENSE & AUDIT MODAL (REDESIGNED FOR MAXIMUM CLARITY & BEAUTY) */}
      <Dialog open={monthModalOpen} onOpenChange={setMonthModalOpen}>
        <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50 border-slate-300 rounded-2xl sm:rounded-3xl shadow-2xl">
          {selectedMonth && (
            <>
              {/* Ultra-Compact Modal Header & Structured Metrics for Mobile & Desktop */}
              <div className="bg-white border-b border-slate-200 px-3 py-2 sm:px-6 sm:py-3 shrink-0">
                <div className="flex items-center justify-between gap-2 pr-7 sm:pr-9">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge className="bg-aims-navy text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 shrink-0">
                      {selectedMonth.month}
                    </Badge>
                    <h2 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight truncate">
                      {selectedMonth.fullMonth || selectedMonth.month} Audit Ledger
                    </h2>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleExportMonthCSV}
                    className="h-6 sm:h-7 px-2 sm:px-2.5 gap-1 text-[10px] sm:text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs shrink-0 rounded-lg"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden xs:inline">Export CSV</span>
                    <span className="xs:hidden">CSV</span>
                  </Button>
                </div>

                {/* Structured 3-Column Metrics Strip: Balanced and compact on all devices */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mt-2 pt-1.5 border-t border-slate-100">
                  <div className="bg-rose-50/90 border border-rose-200/90 rounded-lg px-2 py-1 sm:py-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-0.5 truncate">
                      <TrendingDown className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">Outflow</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-rose-700 truncate">
                      {formatCurrency(monthStats.expenseTotal)}
                    </span>
                  </div>

                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-lg px-2 py-1 sm:py-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-0.5 truncate">
                      <TrendingUp className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">Inflow</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-700 truncate">
                      {formatCurrency(monthStats.incomeTotal)}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "border rounded-lg px-2 py-1 sm:py-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0",
                      monthStats.netMargin >= 0
                        ? "bg-indigo-50/90 border-indigo-200/90 text-indigo-900"
                        : "bg-amber-50/90 border-amber-200/90 text-amber-900"
                    )}
                  >
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 truncate">
                      <Activity className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">Net</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black truncate">
                      {formatCurrency(monthStats.netMargin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile-Friendly Toolbar: Clean segmented tabs & search */}
              <div className="px-2.5 py-1.5 sm:px-6 sm:py-2 bg-slate-100/90 border-b border-slate-200 space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-2 shrink-0">
                {/* Type Tabs: Full-width segmented toggle on mobile */}
                <div className="grid grid-cols-3 sm:inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setMonthTypeFilter("expense")}
                    className={cn(
                      "py-1 sm:px-2.5 text-[11px] sm:text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1",
                      monthTypeFilter === "expense"
                        ? "bg-rose-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <TrendingDown className="h-3 w-3 shrink-0" />
                    <span className="truncate">Expenses ({monthStats.expenseCount})</span>
                  </button>
                  <button
                    onClick={() => setMonthTypeFilter("income")}
                    className={cn(
                      "py-1 sm:px-2.5 text-[11px] sm:text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1",
                      monthTypeFilter === "income"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <TrendingUp className="h-3 w-3 shrink-0" />
                    <span className="truncate">Inflow ({monthStats.incomeCount})</span>
                  </button>
                  <button
                    onClick={() => setMonthTypeFilter("all")}
                    className={cn(
                      "py-1 sm:px-2.5 text-[11px] sm:text-xs font-bold rounded-md transition-all flex items-center justify-center",
                      monthTypeFilter === "all"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span className="truncate">All ({currentMonthTransactions.length})</span>
                  </button>
                </div>

                {/* Search Bar, Category Dropdown & View Mode */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto sm:flex-1 sm:max-w-md sm:ml-auto">
                  {/* Compact Category Dropdown */}
                  {Object.keys(monthStats.categoryTotals).length > 0 && (
                    <div className="shrink-0 max-w-[125px] sm:max-w-[170px]">
                      <select
                        value={monthCategoryFilter}
                        onChange={(e) => setMonthCategoryFilter(e.target.value)}
                        className="w-full h-7 text-[11px] sm:text-xs font-semibold bg-white border border-slate-200 rounded-lg px-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-aims-navy truncate"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(monthStats.categoryTotals).map(([cat, info]) => (
                          <option key={cat} value={cat}>
                            {cat} ({formatCurrency(info.amount)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="h-3 w-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <Input
                      value={monthSearch}
                      onChange={(e) => setMonthSearch(e.target.value)}
                      placeholder="Search description, ref..."
                      className="h-7 pl-6 pr-6 text-[11px] sm:text-xs bg-white border-slate-200 rounded-lg w-full"
                    />
                    {monthSearch && (
                      <button
                        onClick={() => setMonthSearch("")}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle: Cards vs Table */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shrink-0">
                    <button
                      onClick={() => setViewMode("cards")}
                      title="Card View (Clean & Spacious)"
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        viewMode === "cards" ? "bg-aims-navy text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <LayoutList className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      title="Table View (Compact Spreadsheet)"
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        viewMode === "table" ? "bg-aims-navy text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions Content Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {filteredMonthTransactions.length === 0 ? (
                  <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Receipt className="h-12 w-12 text-slate-300 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-800">No transactions found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {monthSearch || monthCategoryFilter !== "all"
                          ? "No transactions match your current search and category filters."
                          : `No ${monthTypeFilter === "expense" ? "expense" : "transaction"} records exist for ${
                              selectedMonth.fullMonth || selectedMonth.month
                            }.`}
                      </p>
                    </div>
                    {(monthSearch || monthCategoryFilter !== "all") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMonthSearch("");
                          setMonthCategoryFilter("all");
                        }}
                        className="text-xs font-bold text-slate-700"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : viewMode === "cards" ? (
                  /* ========================================================
                     VIEW MODE 1: HIGH-CLARITY CARDS (RECOMMENDED DEFAULT)
                     ======================================================== */
                  <div className="space-y-3">
                    {filteredMonthTransactions.map((tx) => {
                      const isExpense = tx.type === "expense";
                      const dateObj = new Date(tx.date);
                      const dayNumber = !isNaN(dateObj.getTime()) ? dateObj.getDate() : "--";
                      const monthShort = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()
                        : "---";
                      const fullDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : tx.date;

                      return (
                        <div
                          key={tx.id}
                          className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 group"
                        >
                          {/* Left: Date Block & Transaction Info */}
                          <div className="flex items-start gap-2.5 sm:gap-4 min-w-0 flex-1">
                            {/* Calendar Date Block */}
                            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-slate-300 transition-colors">
                              <span className="text-[9px] sm:text-xs font-extrabold text-slate-400 leading-none uppercase">
                                {monthShort}
                              </span>
                              <span className="text-sm sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                                {dayNumber}
                              </span>
                            </div>

                            {/* Middle: Details */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full border shadow-2xs shrink-0",
                                    getCategoryBadgeClass(tx.category, tx.type)
                                  )}
                                >
                                  {tx.category || "General"}
                                </Badge>

                                {tx.reference_no && (
                                  <button
                                    onClick={(e) => handleCopyRef(tx.reference_no, e)}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 transition-colors border border-slate-200 shrink-0 max-w-[130px] truncate"
                                    title="Click to copy voucher / reference"
                                  >
                                    <span className="truncate">#{tx.reference_no}</span>
                                    {copiedRef === tx.reference_no ? (
                                      <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Copy className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                    )}
                                  </button>
                                )}

                                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                  {fullDate}
                                </span>
                              </div>

                              {/* Prominent Description */}
                              <h3 className="font-extrabold text-slate-900 text-xs sm:text-base leading-snug break-words">
                                {tx.description}
                              </h3>

                              {/* Recipient & Logged-by Footer */}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                                {tx.recipient_profile?.full_name ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                    <UserCheck className="h-3 w-3 text-aims-green shrink-0" />
                                    <span className="truncate max-w-[150px]">Paid To: {tx.recipient_profile.full_name}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                                    <Wallet className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span>Direct Expense</span>
                                  </span>
                                )}

                                {tx.recorded_by_profile?.full_name && (
                                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                                    Logged by: <strong>{tx.recorded_by_profile.full_name}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Voucher Button */}
                          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-left md:text-right">
                              <div
                                className={cn(
                                  "text-base sm:text-2xl font-black tracking-tight",
                                  isExpense ? "text-rose-600" : "text-emerald-600"
                                )}
                              >
                                {isExpense ? "-" : "+"}
                                {formatCurrency(Number(tx.amount))}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {isExpense ? "Debit Outflow" : "Credit Inflow"}
                              </span>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleViewReceipt(tx, e)}
                              className="h-7 sm:h-8 px-2.5 gap-1 text-[11px] sm:text-xs font-bold text-aims-navy border-slate-200 hover:bg-slate-100 shadow-2xs rounded-lg"
                            >
                              <Receipt className="h-3 w-3 text-aims-navy shrink-0" />
                              <span>View Voucher</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ========================================================
                     VIEW MODE 2: CLEAN TABLE VIEW WITH GENEROUS SPACING
                     ======================================================== */
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[750px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-3 px-4 w-[110px]">Date</th>
                          <th className="py-3 px-4 min-w-[220px]">Description & Particulars</th>
                          <th className="py-3 px-3 w-[150px]">Category</th>
                          <th className="py-3 px-3 min-w-[150px]">Paid To / Recipient</th>
                          <th className="py-3 px-3 min-w-[140px]">Reference</th>
                          <th className="py-3 px-4 text-right w-[140px]">Amount</th>
                          <th className="py-3 px-3 text-center w-[100px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredMonthTransactions.map((tx) => {
                          const isExpense = tx.type === "expense";
                          const fullDate = new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });

                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                {fullDate}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-extrabold text-slate-900 leading-snug break-words">
                                  {tx.description}
                                </div>
                                {tx.recorded_by_profile?.full_name && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Logged by: {tx.recorded_by_profile.full_name}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    getCategoryBadgeClass(tx.category, tx.type)
                                  )}
                                >
                                  {tx.category || "General"}
                                </Badge>
                              </td>

                              <td className="py-3.5 px-3 text-slate-700">
                                {tx.recipient_profile?.full_name ? (
                                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                                    <UserCheck className="h-3.5 w-3.5 text-aims-green shrink-0" />
                                    <span>{tx.recipient_profile.full_name}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs italic">Direct Expense</span>
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                {tx.reference_no ? (
                                  <button
                                    onClick={(e) => handleCopyRef(tx.reference_no, e)}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 transition-colors border"
                                    title="Click to copy reference"
                                  >
                                    <span>#{tx.reference_no}</span>
                                    {copiedRef === tx.reference_no ? (
                                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-2.5 w-2.5 text-slate-400" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-slate-300 font-mono">—</span>
                                )}
                              </td>

                              <td
                                className={cn(
                                  "py-3.5 px-4 text-right font-black text-sm whitespace-nowrap",
                                  isExpense ? "text-rose-600" : "text-emerald-600"
                                )}
                              >
                                {isExpense ? "-" : "+"}
                                {formatCurrency(Number(tx.amount))}
                              </td>

                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => handleViewReceipt(tx, e)}
                                  className="h-7 px-2 text-[11px] font-bold text-aims-navy hover:bg-slate-100 gap-1 rounded-lg"
                                >
                                  <Receipt className="h-3 w-3 text-aims-navy" />
                                  <span>Voucher</span>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-2.5 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
                <div className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">
                  Displaying <strong>{filteredMonthTransactions.length}</strong> of <strong>{currentMonthTransactions.length}</strong> records in {selectedMonth.month}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthModalOpen(false)}
                  className="bg-white border-slate-300 hover:bg-slate-100 text-xs font-bold px-3 sm:px-4 h-7 sm:h-8 shrink-0"
                >
                  Close Sheet
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Official Printable Voucher Modal */}
      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </div>
  );
}
