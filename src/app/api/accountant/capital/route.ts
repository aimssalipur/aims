import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";
import { computeLoanMetrics, type CalculateLoanParams } from "@/lib/loan-calculator";

export const dynamic = "force-dynamic";

// 1. GET: Fetch capital inflow records & metrics
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const supabase = createAdminClient();

  let query = supabase
    .from("capital_inflow_records")
    .select(`
      *,
      recorded_by_profile:profiles!recorded_by(id, full_name, email, role),
      repayments:capital_repayments(*)
    `)
    .order("received_date", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (search) {
    const sanitizedSearch = search.replace(/[%_]/g, "\\$&").slice(0, 100);
    query = query.or(`lender_name.ilike.%${sanitizedSearch}%,account_number.ilike.%${sanitizedSearch}%,purpose.ilike.%${sanitizedSearch}%,payment_reference.ilike.%${sanitizedSearch}%`);
  }

  const { data: records, error } = await query;
  if (error) {
    console.error("[api/accountant/capital] GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve capital records." }, { status: 500 });
  }

  // Aggregate metrics
  let totalPrincipalBorrowed = 0;
  let totalBankLoans = 0;
  let totalPrivateBorrowings = 0;
  let totalInterestPayable = 0;
  let totalAmountRepaid = 0;
  let totalOutstandingBalance = 0;
  let activeLoansCount = 0;

  if (records) {
    records.forEach((r: any) => {
      const principal = parseFloat(r.principal_amount) || 0;
      const repaid = parseFloat(r.amount_repaid) || 0;
      const remaining = parseFloat(r.remaining_balance) || 0;
      const interest = parseFloat(r.total_interest) || 0;

      totalPrincipalBorrowed += principal;
      totalInterestPayable += interest;
      totalAmountRepaid += repaid;
      totalOutstandingBalance += remaining;

      if (r.type === "bank_loan") {
        totalBankLoans += principal;
      } else {
        totalPrivateBorrowings += principal;
      }

      if (r.status === "active") {
        activeLoansCount += 1;
      }
    });
  }

  return NextResponse.json({
    records: records || [],
    metrics: {
      totalPrincipalBorrowed,
      totalBankLoans,
      totalPrivateBorrowings,
      totalInterestPayable,
      totalAmountRepaid,
      totalOutstandingBalance,
      activeLoansCount,
      totalCount: records?.length || 0,
    },
  });
}

// 2. POST: Create a new capital inflow / loan record
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      type,
      lender_name,
      lender_contact,
      account_number,
      principal_amount,
      interest_rate_percent,
      tenure_months,
      interest_type = "reducing_emi",
      received_date,
      due_date,
      payment_method = "Bank Transfer",
      payment_reference,
      purpose,
      notes,
      sync_to_ledger = false,
    } = body;

    if (!type || !lender_name || principal_amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: type, lender_name, principal_amount." },
        { status: 400 }
      );
    }

    const P = Number(principal_amount);
    if (!Number.isFinite(P) || P <= 0) {
      return NextResponse.json({ error: "Principal amount must be a positive number." }, { status: 400 });
    }

    const R = Math.max(0, Number(interest_rate_percent) || 0);
    const n = Math.max(1, Math.round(Number(tenure_months) || 12));
    const validInterestType = ["reducing_emi", "flat_simple", "zero_interest"].includes(interest_type)
      ? interest_type
      : "reducing_emi";

    // Auto-calculate loan numbers
    const { monthlyEmi, totalInterest, totalPayable } = computeLoanMetrics({
      principal: P,
      annualRate: R,
      tenureMonths: n,
      interestType: validInterestType,
    });

    const supabase = createAdminClient();

    // Prevent accidental rapid duplicate submissions within 8 seconds
    const eightSecondsAgo = new Date(Date.now() - 8_000).toISOString();
    const { data: recentDuplicate } = await supabase
      .from("capital_inflow_records")
      .select("id")
      .eq("recorded_by", context.user.id)
      .eq("lender_name", String(lender_name).trim())
      .eq("principal_amount", P)
      .gte("created_at", eightSecondsAgo)
      .limit(1)
      .maybeSingle();

    if (recentDuplicate) {
      return NextResponse.json(
        { error: "A matching loan record was just logged a few seconds ago. Please wait a moment to avoid duplicate entries." },
        { status: 409 }
      );
    }

    const insertData: any = {
      type,
      lender_name: String(lender_name).trim().slice(0, 150),
      lender_contact: lender_contact ? String(lender_contact).trim().slice(0, 100) : null,
      account_number: account_number ? String(account_number).trim().slice(0, 100) : null,
      principal_amount: P,
      interest_rate_percent: R,
      tenure_months: n,
      interest_type: validInterestType,
      monthly_emi: monthlyEmi,
      total_interest: totalInterest,
      total_payable: totalPayable,
      amount_repaid: 0,
      remaining_balance: totalPayable,
      received_date: received_date || new Date().toISOString().split("T")[0],
      due_date: due_date || null,
      payment_method: payment_method || "Bank Transfer",
      payment_reference: payment_reference ? String(payment_reference).trim().slice(0, 100) : null,
      purpose: purpose ? String(purpose).trim().slice(0, 300) : null,
      status: "active",
      notes: notes ? String(notes).trim().slice(0, 1000) : null,
      recorded_by: context.user.id,
    };

    const { data: newRecord, error: insertError } = await supabase
      .from("capital_inflow_records")
      .insert(insertData)
      .select(`
        *,
        recorded_by_profile:profiles!recorded_by(id, full_name, email, role)
      `)
      .single();

    if (insertError) {
      console.error("[api/accountant/capital] POST error:", insertError);
      return NextResponse.json({ error: insertError.message || "Failed to create capital record." }, { status: 500 });
    }

    // Optional: Sync as an Inflow in business_transactions ledger
    if (sync_to_ledger) {
      try {
        const categoryLabel = type === "bank_loan" ? "Capital / Bank Loan" : "Capital / Private Borrowing";
        const ledgerDesc = `Capital Inflow: ${insertData.lender_name} (${insertData.payment_method}${insertData.payment_reference ? ` - Ref: ${insertData.payment_reference}` : ""})`;
        await supabase.from("business_transactions").insert({
          type: "income",
          category: categoryLabel,
          amount: P,
          description: ledgerDesc,
          date: insertData.received_date,
          reference_no: insertData.account_number || insertData.payment_reference || `CAP-${newRecord.id.slice(0, 8)}`,
          recorded_by: context.user.id,
        });
      } catch (syncErr) {
        console.warn("[api/accountant/capital] Optional ledger sync notice:", syncErr);
      }
    }

    return NextResponse.json(newRecord);
  } catch (err: any) {
    console.error("[api/accountant/capital] POST exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to save capital inflow." }, { status: 500 });
  }
}

// 3. DELETE: Remove a capital record
export async function DELETE(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing capital record id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("capital_inflow_records")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[api/accountant/capital] DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete record." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
