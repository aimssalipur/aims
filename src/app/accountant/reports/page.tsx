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
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  DollarSign,
  Briefcase,
  Download,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AccountantReportsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
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
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

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
      t.description.replace(/"/g, '""'), // escape double quotes
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
      description: "Financial ledger sheet saved successfully.",
      variant: "success",
    });
  };

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
    <div className="space-y-6 lg:space-y-8 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Statements & Audits 📊
          </h1>
          <p className="text-slate-500 mt-2 text-base font-semibold">
            Evaluate annual/monthly revenues, operational expenditures, and sheet exports.
          </p>
        </div>
        <Button onClick={handleExportCSV} size="lg" className="gap-2 h-11 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-0">
          <FileSpreadsheet className="h-4.5 w-4.5" />
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-100 bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Gross Income Inflow</CardTitle>
              <h2 className="text-2xl font-extrabold text-slate-950 mt-1">{formatCurrency(metrics.totalRevenue)}</h2>
            </div>
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>All student course fee verifications & offline income logs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Gross Expenditure Outflow</CardTitle>
              <h2 className="text-2xl font-extrabold text-slate-950 mt-1">{formatCurrency(metrics.totalExpenses)}</h2>
            </div>
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>Operational costs including facility rent, vendor salaries & utility bills</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Net Working Capital</CardTitle>
              <h2 className={`text-2xl font-extrabold mt-1 ${metrics.netProfit >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
                {formatCurrency(metrics.netProfit)}
              </h2>
            </div>
            <div className="h-10 w-10 bg-indigo-100/80 rounded-xl flex items-center justify-center text-indigo-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-indigo-600">
              <span>Net operational reserve status (Revenue minus Expenditures)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregate Report Sheets */}
      <Card className="border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-slate-900">Monthly Cash Reserve Flow Sheet</CardTitle>
          <CardDescription className="font-semibold text-slate-400">Monthly income vs expense aggregates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-6 text-right">Inflow (Revenue)</th>
                  <th className="py-4 px-6 text-right">Outflow (Expense)</th>
                  <th className="py-4 px-6 text-right">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 bg-white">
                {data?.chartData?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No monthly cycles logged yet.</td>
                  </tr>
                ) : (
                  data?.chartData?.map((item: any) => {
                    const margin = item.revenue - item.expenses;
                    return (
                      <tr key={item.month} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-900 font-bold">{item.month}</td>
                        <td className="py-4 px-6 text-right text-emerald-600">{formatCurrency(item.revenue)}</td>
                        <td className="py-4 px-6 text-right text-rose-600">{formatCurrency(item.expenses)}</td>
                        <td className={`py-4 px-6 text-right font-extrabold ${margin >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
                          {formatCurrency(margin)}
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
    </div>
  );
}
