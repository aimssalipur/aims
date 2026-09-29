import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      loan_id,
      amount,
      payment_date,
      payment_method = "Bank Transfer",
      payment_reference,
      notes,
      sync_to_ledger = false,
    } = body;

    if (!loan_id || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields: loan_id, amount." }, { status: 400 });
    }

    const repaymentAmount = Number(amount);
    if (!Number.isFinite(repaymentAmount) || repaymentAmount <= 0) {
      return NextResponse.json({ error: "Repayment amount must be a positive number." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch current loan details
    const { data: loan, error: loanErr } = await supabase
      .from("capital_inflow_records")
      .select("*")
      .eq("id", loan_id)
      .single();

    if (loanErr || !loan) {
      return NextResponse.json({ error: "Loan / borrowing record not found." }, { status: 404 });
    }

    const currentRepaid = parseFloat(loan.amount_repaid) || 0;
    const totalPayable = parseFloat(loan.total_payable) || 0;
    const newRepaid = Math.round((currentRepaid + repaymentAmount) * 100) / 100;
    const newBalance = Math.max(0, Math.round((totalPayable - newRepaid) * 100) / 100);
    const newStatus = newBalance <= 0 ? "settled" : "active";

    // 2. Insert repayment entry
    const { data: repayment, error: repayErr } = await supabase
      .from("capital_repayments")
      .insert({
        loan_id,
        amount: repaymentAmount,
        payment_date: payment_date || new Date().toISOString().split("T")[0],
        payment_method: payment_method || "Bank Transfer",
        payment_reference: payment_reference ? String(payment_reference).trim().slice(0, 100) : null,
        notes: notes ? String(notes).trim().slice(0, 500) : null,
        recorded_by: context.user.id,
      })
      .select()
      .single();

    if (repayErr) {
      console.error("[api/accountant/capital/repayments] Insert error:", repayErr);
      return NextResponse.json({ error: repayErr.message || "Failed to record repayment." }, { status: 500 });
    }

    // 3. Update loan record balance & status
    await supabase
      .from("capital_inflow_records")
      .update({
        amount_repaid: newRepaid,
        remaining_balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loan_id);

    // 4. Optional: Sync as an Expense outflow in general business ledger
    if (sync_to_ledger) {
      try {
        const ledgerCategory = loan.type === "bank_loan" ? "Loan Repayment / Bank EMI" : "Loan Repayment / Private Lender";
        const ledgerDesc = `Loan Repayment to ${loan.lender_name} (${payment_method}${payment_reference ? ` - Ref: ${payment_reference}` : ""})`;
        await supabase.from("business_transactions").insert({
          type: "expense",
          category: ledgerCategory,
          amount: repaymentAmount,
          description: ledgerDesc,
          date: payment_date || new Date().toISOString().split("T")[0],
          reference_no: payment_reference || `REPAY-${repayment.id.slice(0, 8)}`,
          recorded_by: context.user.id,
        });
      } catch (syncErr) {
        console.warn("[api/accountant/capital/repayments] Optional ledger sync notice:", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      repayment,
      updatedLoan: {
        amount_repaid: newRepaid,
        remaining_balance: newBalance,
        status: newStatus,
      },
    });
  } catch (err: any) {
    console.error("[api/accountant/capital/repayments] Exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process repayment." }, { status: 500 });
  }
}
