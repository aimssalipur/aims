import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export async function GET() {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const supabase = createClient();

    // Query all transactions
    const { data: txs, error: txsError } = await supabase
      .from("business_transactions")
      .select("type, amount, category, date");

    if (txsError) {
      return NextResponse.json({ error: txsError.message }, { status: 500 });
    }

    // Query pending fees
    const { data: pendingFees, error: feesError } = await supabase
      .from("fees_payments")
      .select("amount_paid")
      .eq("status", "pending");

    if (feesError) {
      return NextResponse.json({ error: feesError.message }, { status: 500 });
    }

    let totalRevenue = 0;
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};
    const monthlyFlows: Record<string, { month: string; revenue: number; expenses: number }> = {};

    // Pre-initialize last 6 months to ensure correct chronological ordering
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthlyFlows[label] = { month: label, revenue: 0, expenses: 0 };
    }

    if (txs) {
      txs.forEach((t: any) => {
        const amt = parseFloat(t.amount);
        if (t.type === "income") {
          totalRevenue += amt;
        } else {
          totalExpenses += amt;
          categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + amt;
        }

        // Parse date and bucket into month-year label
        const dateObj = new Date(t.date);
        const label = dateObj.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        if (monthlyFlows[label]) {
          if (t.type === "income") {
            monthlyFlows[label].revenue += amt;
          } else {
            monthlyFlows[label].expenses += amt;
          }
        }
      });
    }

    const totalPendingFees = pendingFees
      ? pendingFees.reduce((acc: number, item: any) => acc + parseFloat(item.amount_paid), 0)
      : 0;

    const netProfit = totalRevenue - totalExpenses;

    // Convert monthly flows object to array list
    const chartData = Object.values(monthlyFlows);

    // Format category breakdown for pie chart
    const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalPendingFees,
      },
      chartData,
      pieData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
