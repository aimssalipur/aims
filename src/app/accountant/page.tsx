"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  FileCheck2,
  Calendar,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Clock,
  FileSpreadsheet,
  GraduationCap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

export default function AccountantOverviewPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch("/api/accountant/summary");
      const summaryData = await summaryRes.json();
      if (summaryData.metrics) {
        setData(summaryData);
      }

      const txRes = await fetch("/api/accountant/transactions");
      const txData = await txRes.json();
      if (Array.isArray(txData)) {
        setRecentTx(txData.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching data",
        description: "Failed to connect to the financial ledger.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="font-semibold text-slate-500">Loading ledger data...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalPendingFees: 0,
  };

  const statCards = [
    {
      label: "Total Cash Inflow",
      value: formatCurrency(metrics.totalRevenue),
      desc: "All time received payments & fees",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Operational Expenses",
      value: formatCurrency(metrics.totalExpenses),
      desc: "Salaries, utility bills, maintenance",
      icon: Briefcase,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "Net Capital Balance",
      value: formatCurrency(metrics.netProfit),
      desc: "Available organizational funds",
      icon: TrendingUp,
      color: metrics.netProfit >= 0 ? "text-indigo-600" : "text-amber-600",
      bg: metrics.netProfit >= 0 ? "bg-indigo-50" : "bg-amber-50",
      border: metrics.netProfit >= 0 ? "border-indigo-100" : "border-amber-100",
    },
    {
      label: "Pending Fees Log",
      value: formatCurrency(metrics.totalPendingFees),
      desc: "Awaiting approval / verification",
      icon: FileCheck2,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      {/* Hero Header */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 text-white relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-36 -left-10 w-80 h-80 bg-indigo-950/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative p-6 md:p-8 lg:p-10 grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur w-fit gap-1.5 font-bold">
              <Sparkles className="h-3 w-3" /> Financial Command Center
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Finance & Ledger overview 📈
              <br />
              <span className="text-white/80 font-medium text-lg md:text-xl">
                AIMS Salipur operational cash flow & fee verifications dashboard.
              </span>
            </h1>
            <div className="flex gap-3 pt-2">
              <Button asChild size="sm" className="bg-white text-indigo-700 hover:bg-slate-100 font-bold rounded-xl h-10 shadow-lg">
                <Link href="/accountant/transactions">
                  <PlusCircle className="h-4.5 w-4.5 mr-1.5" /> Log Transaction
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-white/10 text-white hover:bg-white/15 border-white/20 font-bold rounded-xl h-10">
                <Link href="/accountant/fees">
                  Verify Student Fees
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/15 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/20 border-0 text-emerald-100 w-fit text-[10px] font-bold uppercase tracking-widest">
                Realtime Sync
              </Badge>
              <Button variant="ghost" size="icon" onClick={fetchSummary} className="h-8 w-8 text-white hover:bg-white/10">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/70">Current Cash Reserve</div>
              <div className="text-3xl font-extrabold tracking-tight mt-1">{formatCurrency(metrics.netProfit)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className={`group overflow-hidden border ${m.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white`}>
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {m.value}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                      {m.label}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 border-t pt-2 font-medium">
                  {m.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Tools & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-indigo-600" />
              General Ledger
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-400">Quick shortcuts to record entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none border-0 h-11">
              <Link href="/accountant/transactions">
                <PlusCircle className="h-4.5 w-4.5 mr-2" /> Log Operational Expense
              </Link>
            </Button>
            <Button asChild className="w-full justify-start rounded-xl font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-none border-0 h-11">
              <Link href="/accountant/transactions">
                <PlusCircle className="h-4.5 w-4.5 mr-2" /> Log Business Income
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-amber-600" />
              Student Tuition Fees
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-400">Direct fee verifications and logging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start rounded-xl font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-none border-0 h-11">
              <Link href="/accountant/fees?status=pending">
                <Clock className="h-4.5 w-4.5 mr-2" /> Pending Approvals
              </Link>
            </Button>
            <Button asChild className="w-full justify-start rounded-xl font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none border-0 h-11">
              <Link href="/accountant/fees?log=true">
                <PlusCircle className="h-4.5 w-4.5 mr-2" /> Record Office Cash Payment
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4.5 w-4.5 text-sky-600" />
              Audits & Exports
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-400">Financial audits and sharing tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start rounded-xl font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 shadow-none border-0 h-11">
              <Link href="/accountant/reports">
                <FileSpreadsheet className="h-4.5 w-4.5 mr-2" /> View Monthly P&L Sheet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cashflow Trend */}
        <Card className="lg:col-span-2 border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-900">Cash Flow Trends (Last 6 Months)</CardTitle>
            <CardDescription className="font-semibold text-slate-400">Monthly breakdown of revenues vs operational expenditures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 11, fontWeight: 600, fill: "#94A3B8" }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fontWeight: 600, fill: "#94A3B8" }} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value) => [formatCurrency(Number(value)), ""]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 10 }} />
                    <Area type="monotone" name="Inflow (Revenue)" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                    <Area type="monotone" name="Outflow (Expense)" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#expGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 font-semibold">No monthly data logged yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Distribution */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-900">Operational Expenditure Breakdown</CardTitle>
            <CardDescription className="font-semibold text-slate-400">Total expense allocation by operational category</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-60 w-full relative flex items-center justify-center">
              {data?.pieData && data.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 font-semibold">No expense records found.</div>
              )}
            </div>
            <div className="w-full space-y-1.5 mt-2 border-t pt-4">
              {data?.pieData?.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                  <div className="font-bold text-slate-900">{formatCurrency(entry.value)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ledger Transactions */}
      <Card className="border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900">Recent Transactions</CardTitle>
            <CardDescription className="font-semibold text-slate-400">A snapshot of the latest logged income and expenditures</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="font-bold rounded-xl">
            <Link href="/accountant/transactions">View Ledger</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method / Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                {recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No transactions recorded.</td>
                  </tr>
                ) : (
                  recentTx.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-500">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 max-w-xs truncate">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="capitalize border-slate-200">
                          {tx.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{tx.reference_no || "N/A"}</td>
                      <td className={`py-3.5 px-4 text-right font-extrabold text-base ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
