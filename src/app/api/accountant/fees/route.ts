import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

const ALLOWED_PAYMENT_METHODS = new Set(["UPI", "Cash", "Bank Transfer", "Card", "Other"]);
const ALLOWED_PAYMENT_STATUSES = new Set(["pending", "verified", "rejected"]);

// 1. GET: Retrieve fees list with student profile details
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("student_id");

  const supabase = createClient();
  let query = supabase
    .from("fees_payments")
    .select("*, student:profiles!student_id(full_name, email, whatsapp, course_of_interest), verifier:profiles!verified_by(full_name)")
    .order("created_at", { ascending: false });

  if (status && status !== "all" && ALLOWED_PAYMENT_STATUSES.has(status)) {
    query = query.eq("status", status);
  }
  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to retrieve fee records." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 2. POST: Manually log student fee payments (UPI, Cash, bank transfer, card)
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { student_id, amount_paid, payment_method, transaction_id, remarks, status } = body;

    if (!student_id || amount_paid === undefined || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, amount_paid, payment_method" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount_paid);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10_000_000) {
      return NextResponse.json(
        { error: "Invalid payment amount. Amount must be greater than 0 and up to 10,000,000." },
        { status: 400 }
      );
    }

    const sanitizedMethod = String(payment_method).trim();
    if (!ALLOWED_PAYMENT_METHODS.has(sanitizedMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method. Allowed: UPI, Cash, Bank Transfer, Card, Other" },
        { status: 400 }
      );
    }

    const targetStatus = status && ALLOWED_PAYMENT_STATUSES.has(status) ? status : "pending";
    const supabase = createClient();
    const isManualVerification = targetStatus === "verified";

    const { data, error } = await supabase
      .from("fees_payments")
      .insert({
        student_id,
        amount_paid: parsedAmount,
        payment_method: sanitizedMethod,
        transaction_id: transaction_id ? String(transaction_id).trim().slice(0, 100) : null,
        remarks: remarks ? String(remarks).trim().slice(0, 500) : null,
        status: targetStatus,
        verified_by: isManualVerification ? context.user.id : null,
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to record fee payment." }, { status: 500 });
    }

    // Automatically record this as an income transaction in business_transactions if it is verified
    if (isManualVerification) {
      const studentProfile = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", student_id)
        .single();
      
      const studentName = studentProfile.data?.full_name || "Student";
      
      await supabase.from("business_transactions").insert({
        type: "income",
        category: "Course Fee",
        amount: parsedAmount,
        description: `Fee received from ${studentName}${remarks ? ` (${remarks})` : ""}`,
        recorded_by: context.user.id,
        reference_no: transaction_id,
        date: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "An error occurred while processing payment." }, { status: 500 });
  }
}

// 3. PUT: Update transaction status (Verify or Reject student fee submission)
export async function PUT(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, status, remarks } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id, status" }, { status: 400 });
    }

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status values. Allowed: verified, rejected" }, { status: 400 });
    }

    const supabase = createClient();

    // Get current payment record to extract amount/student details
    const { data: currentPayment, error: fetchError } = await supabase
      .from("fees_payments")
      .select("*, student:profiles!student_id(full_name)")
      .eq("id", id)
      .single();

    if (fetchError || !currentPayment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    // Perform verification update
    const { data, error } = await supabase
      .from("fees_payments")
      .update({
        status,
        remarks: remarks ? String(remarks).trim().slice(0, 500) : currentPayment.remarks,
        verified_by: context.user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update payment status." }, { status: 500 });
    }

    // If verified and status was previously pending, create income transaction in business ledger
    if (status === "verified" && currentPayment.status !== "verified") {
      const studentName = currentPayment.student?.full_name || "Student";
      await supabase.from("business_transactions").insert({
        type: "income",
        category: "Course Fee",
        amount: currentPayment.amount_paid,
        description: `Fee verified for ${studentName}${remarks ? ` (${remarks})` : ""}`,
        recorded_by: context.user.id,
        reference_no: currentPayment.transaction_id,
        date: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update fee record." }, { status: 500 });
  }
}
