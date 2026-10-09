import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const ALLOWED_PAYMENT_METHODS = new Set(["UPI", "Cash", "Bank Transfer", "Card", "Other"]);
const ALLOWED_PAYMENT_STATUSES = new Set(["pending", "verified", "rejected"]);

// 1. GET: Retrieve fees list with student profile details
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("student_id");

  const supabase = createAdminClient();
  let query = supabase
    .from("fees_payments")
    .select("*, student:profiles!student_id(full_name, email, whatsapp, course_of_interest), verifier:profiles!verified_by(full_name), course:courses!course_id(id, title)")
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
    const { student_id, course_id, amount_paid, payment_method, transaction_id, remarks, status, payment_date } = body;

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
    const supabase = createAdminClient();
    const isManualVerification = targetStatus === "verified";
    const finalPaymentDate = payment_date ? new Date(payment_date).toISOString() : new Date().toISOString();

    // Prevent accidental double clicks / duplicate fee submissions within 8 seconds
    const eightSecondsAgo = new Date(Date.now() - 8_000).toISOString();
    const { data: recentDuplicate } = await supabase
      .from("fees_payments")
      .select("id")
      .eq("student_id", student_id)
      .eq("amount_paid", parsedAmount)
      .eq("payment_method", sanitizedMethod)
      .gte("created_at", eightSecondsAgo)
      .limit(1)
      .maybeSingle();

    if (recentDuplicate) {
      return NextResponse.json(
        { error: "A matching payment entry was just submitted a few seconds ago. Please wait a moment to avoid duplicate records." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("fees_payments")
      .insert({
        student_id,
        course_id: course_id || null,
        amount_paid: parsedAmount,
        payment_method: sanitizedMethod,
        transaction_id: transaction_id ? String(transaction_id).trim().slice(0, 100) : null,
        remarks: remarks ? String(remarks).trim().slice(0, 500) : null,
        status: targetStatus,
        verified_by: isManualVerification ? context.user.id : null,
        payment_date: finalPaymentDate,
      })
      .select("*, student:profiles!student_id(full_name, email, whatsapp, course_of_interest), course:courses!course_id(id, title)")
      .single();

    if (error) {
      console.error("[api/accountant/fees] POST error:", error);
      return NextResponse.json({ error: error.message || "Failed to record fee payment." }, { status: 500 });
    }

    // Automatically record this as an income transaction in business_transactions if it is verified
    if (isManualVerification) {
      const studentName = data.student?.full_name || "Student";
      const courseTitle = data.course?.title || data.student?.course_of_interest || "";
      
      await supabase.from("business_transactions").insert({
        type: "income",
        category: "Course Fee",
        amount: parsedAmount,
        description: `Fee received from ${studentName}${courseTitle ? ` for ${courseTitle}` : ""}${remarks ? ` (${remarks})` : ""}`,
        recorded_by: context.user.id,
        reference_no: transaction_id,
        date: finalPaymentDate,
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[api/accountant/fees] POST exception:", err);
    return NextResponse.json({ error: err?.message || "An error occurred while processing payment." }, { status: 500 });
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

    const supabase = createAdminClient();

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

// 4. PATCH: Edit and update an existing student fee payment record
export async function PATCH(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, amount_paid, payment_method, transaction_id, remarks, course_id, payment_date, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required fee record id." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify record exists
    const { data: existing, error: fetchErr } = await supabase
      .from("fees_payments")
      .select("*, student:profiles!student_id(full_name, email, whatsapp, course_of_interest)")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Fee payment record not found." }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {};

    if (amount_paid !== undefined) {
      const parsed = Number(amount_paid);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10_000_000) {
        return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
      }
      updatePayload.amount_paid = parsed;
    }

    if (payment_method) {
      const meth = String(payment_method).trim();
      if (!ALLOWED_PAYMENT_METHODS.has(meth)) {
        return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
      }
      updatePayload.payment_method = meth;
    }

    if (transaction_id !== undefined) {
      updatePayload.transaction_id = transaction_id ? String(transaction_id).trim().slice(0, 100) : null;
    }

    if (remarks !== undefined) {
      updatePayload.remarks = remarks ? String(remarks).trim().slice(0, 500) : null;
    }

    if (course_id !== undefined) {
      updatePayload.course_id = course_id || null;
    }

    if (payment_date) {
      updatePayload.payment_date = new Date(payment_date).toISOString();
    }

    if (status && ALLOWED_PAYMENT_STATUSES.has(status)) {
      updatePayload.status = status;
      if (status === "verified" && !existing.verified_by) {
        updatePayload.verified_by = context.user.id;
      }
    }

    const { data: updated, error: updateErr } = await supabase
      .from("fees_payments")
      .update(updatePayload)
      .eq("id", id)
      .select("*, student:profiles!student_id(full_name, email, whatsapp, course_of_interest), course:courses!course_id(id, title), verifier:profiles!verified_by(full_name)")
      .single();

    if (updateErr) {
      console.error("[api/accountant/fees] PATCH error:", updateErr);
      return NextResponse.json({ error: updateErr.message || "Failed to update fee payment." }, { status: 500 });
    }

    // Sync business transaction if transaction_id exists or was updated
    if (existing.transaction_id) {
      await supabase
        .from("business_transactions")
        .update({
          amount: updatePayload.amount_paid ?? existing.amount_paid,
          reference_no: updatePayload.transaction_id !== undefined ? updatePayload.transaction_id : existing.transaction_id,
          date: updatePayload.payment_date ?? existing.payment_date,
        })
        .eq("reference_no", existing.transaction_id);
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[api/accountant/fees] PATCH exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to edit fee record." }, { status: 500 });
  }
}

// 5. DELETE: Delete an erroneous or accidental student fee payment record
export async function DELETE(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Missing required id parameter for deletion." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify record exists before deletion
    const { data: existing, error: fetchErr } = await supabase
      .from("fees_payments")
      .select("id, transaction_id, amount_paid, student:profiles!student_id(full_name)")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Fee payment record not found." }, { status: 404 });
    }

    // Clean up any linked business_transactions entry
    if (existing.transaction_id) {
      await supabase
        .from("business_transactions")
        .delete()
        .eq("reference_no", existing.transaction_id);
    }

    // Delete fee payment
    const { error: deleteErr } = await supabase
      .from("fees_payments")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      console.error("[api/accountant/fees] DELETE error:", deleteErr);
      return NextResponse.json({ error: deleteErr.message || "Failed to delete fee record." }, { status: 500 });
    }

    const studentData = existing.student as any;
    const studentName = (Array.isArray(studentData) ? studentData[0]?.full_name : studentData?.full_name) || "student";

    return NextResponse.json({
      success: true,
      message: `Fee record of ₹${existing.amount_paid} for ${studentName} deleted successfully.`,
    });
  } catch (err: any) {
    console.error("[api/accountant/fees] DELETE exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete fee record." }, { status: 500 });
  }
}
