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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Salary", "Rent", "Utility", "Maintenance", "Equipment", "Marketing", "Course Fee", "Other"];

export default function AccountantTransactionsPage() {
  const { toast } = useToast();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    category: "Utility",
    amount: "",
    description: "",
    reference_no: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, debouncedSearch]);

  const handleCreate = async () => {
    if (!form.amount || !form.description || !form.category) {
      toast({
        title: "Missing fields",
        description: "Please enter an amount, category, and description.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/accountant/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to log transaction",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transaction logged ✅",
          description: `Logged ₹${form.amount} under ${form.category}.`,
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
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record? This action is permanent.")) return;
    try {
      const response = await fetch(`/api/accountant/transactions?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Failed to delete record",
          description: data.error,
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
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-11 text-xs sm:text-sm px-3.5 sm:px-5 shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white border-0 font-bold rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900">Record Operational Entry</DialogTitle>
                <DialogDescription className="font-semibold text-slate-400">
                  Log general business ledger entries here.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={form.type === "income" ? "primary" : "outline"}
                    className={`h-11 rounded-xl font-bold ${form.type === "income" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                    onClick={() => setForm({ ...form, type: "income" })}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1.5 text-emerald-500" />
                    Income
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === "expense" ? "primary" : "outline"}
                    className={`h-11 rounded-xl font-bold ${form.type === "expense" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                    onClick={() => setForm({ ...form, type: "expense" })}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-1.5 text-rose-500" />
                    Expense
                  </Button>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className="font-semibold">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => setForm({ ...form, category: val })}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <Label className="font-semibold">Amount (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      className="pl-8 h-11 rounded-xl font-bold text-slate-900"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Date input */}
                <div className="space-y-2">
                  <Label className="font-semibold">Date</Label>
                  <Input
                    type="date"
                    className="h-11 rounded-xl font-semibold"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                {/* Ref inputs */}
                <div className="space-y-2">
                  <Label className="font-semibold">Reference No. (Optional)</Label>
                  <Input
                    placeholder="e.g. TXN-987452 / CHQ-1002"
                    className="h-11 rounded-xl font-mono"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="font-semibold">Description</Label>
                  <Input
                    placeholder="e.g. Paid Rent for August 2026"
                    className="h-11 rounded-xl"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl h-11 font-semibold">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold">
                  Log Entry
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
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
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
                      <td className="py-2.5 sm:py-4 px-3 sm:px-6 text-slate-900 font-bold max-w-xs truncate">{tx.description}</td>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tx.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
