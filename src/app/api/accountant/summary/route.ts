import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const supabase = createAdminClient();

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
    const monthlyFlows: Record<
      string,
      {
        month: string;
        yearMonth: string;
        fullMonth: string;
        revenue: number;
        expenses: number;
        incomeCount: number;
        expenseCount: number;
        categoryBreakdown: Record<string, number>;
      }
    > = {};

    const getMonthMeta = (dateObj: Date) => {
      const year = dateObj.getFullYear();
      const monthNum = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yearMonth = `${year}-${monthNum}`;
      const month = dateObj.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const fullMonth = dateObj.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      return { yearMonth, month, fullMonth };
    };

    // Pre-initialize last 6 months to ensure chronological display
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const { yearMonth, month, fullMonth } = getMonthMeta(d);
      monthlyFlows[yearMonth] = {
        month,
        yearMonth,
        fullMonth,
        revenue: 0,
        expenses: 0,
        incomeCount: 0,
        expenseCount: 0,
        categoryBreakdown: {},
      };
    }

    if (txs) {
      txs.forEach((t: any) => {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === "income") {
          totalRevenue += amt;
        } else {
          totalExpenses += amt;
          categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + amt;
        }

        // Parse date and bucket into month-year
        const dateObj = new Date(t.date);
        if (!isNaN(dateObj.getTime())) {
          const { yearMonth, month, fullMonth } = getMonthMeta(dateObj);
          if (!monthlyFlows[yearMonth]) {
            monthlyFlows[yearMonth] = {
              month,
              yearMonth,
              fullMonth,
              revenue: 0,
              expenses: 0,
              incomeCount: 0,
              expenseCount: 0,
              categoryBreakdown: {},
            };
          }

          if (t.type === "income") {
            monthlyFlows[yearMonth].revenue += amt;
            monthlyFlows[yearMonth].incomeCount += 1;
          } else {
            monthlyFlows[yearMonth].expenses += amt;
            monthlyFlows[yearMonth].expenseCount += 1;
            monthlyFlows[yearMonth].categoryBreakdown[t.category] =
              (monthlyFlows[yearMonth].categoryBreakdown[t.category] || 0) + amt;
          }
        }
      });
    }

    const totalPendingFees = pendingFees
      ? pendingFees.reduce((acc: number, item: any) => acc + parseFloat(item.amount_paid), 0)
      : 0;

    const netProfit = totalRevenue - totalExpenses;

    // Convert monthly flows object to array list sorted chronologically
    const chartData = Object.values(monthlyFlows).sort((a, b) =>
      a.yearMonth.localeCompare(b.yearMonth)
    );

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
