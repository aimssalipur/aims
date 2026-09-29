import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const ALLOWED_TRANSACTION_TYPES = new Set(["income", "expense"]);

// 1. GET: Fetch transactions
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const supabase = createAdminClient();
  let query = supabase
    .from("business_transactions")
    .select("*, recorded_by_profile:profiles!recorded_by(full_name, email), recipient_profile:profiles!recipient_id(id, full_name, email, role)")
    .order("date", { ascending: false });

  if (type && type !== "all" && ALLOWED_TRANSACTION_TYPES.has(type)) {
    query = query.eq("type", type);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (search) {
    // Sanitize search query: remove potential control characters
    const sanitizedSearch = search.replace(/[%_]/g, "\\$&").slice(0, 100);
    query = query.ilike("description", `%${sanitizedSearch}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[api/accountant/transactions] GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve transactions." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 2. POST: Record a new transaction
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { type, category, amount, description, date, reference_no, recipient_id } = body;

    if (!type || !category || amount === undefined || !description) {
      return NextResponse.json(
        { error: "Missing required fields: type, category, amount, description" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TRANSACTION_TYPES.has(type)) {
      return NextResponse.json({ error: "Transaction type must be 'income' or 'expense'." }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10_000_000) {
      return NextResponse.json(
        { error: "Transaction amount must be a positive number up to 10,000,000." },
        { status: 400 }
      );
    }

    const sanitizedCategory = String(category).trim().slice(0, 100);
    const sanitizedDescription = String(description).trim().slice(0, 500);

    const supabase = createAdminClient();

    // Prevent accidental double clicks / duplicate submissions within 8 seconds
    const eightSecondsAgo = new Date(Date.now() - 8_000).toISOString();
    const { data: recentDuplicate } = await supabase
      .from("business_transactions")
      .select("id")
      .eq("recorded_by", context.user.id)
      .eq("type", type)
      .eq("amount", parsedAmount)
      .eq("category", sanitizedCategory)
      .eq("description", sanitizedDescription)
      .gte("created_at", eightSecondsAgo)
      .limit(1)
      .maybeSingle();

    if (recentDuplicate) {
      return NextResponse.json(
        { error: "A matching transaction was just recorded a few seconds ago. Please wait a moment to avoid duplicate entries." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("business_transactions")
      .insert({
        type,
        category: sanitizedCategory,
        amount: parsedAmount,
        description: sanitizedDescription,
        date: date || new Date().toISOString(),
        reference_no: reference_no ? String(reference_no).trim().slice(0, 100) : null,
        recorded_by: context.user.id,
        recipient_id: recipient_id ? String(recipient_id).trim() : null,
      })
      .select("*, recorded_by_profile:profiles!recorded_by(full_name, email), recipient_profile:profiles!recipient_id(id, full_name, email, role)")
      .single();

    if (error) {
      console.error("[api/accountant/transactions] POST insert error:", error);
      return NextResponse.json({ error: error.message || "Failed to create transaction record." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[api/accountant/transactions] POST exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process transaction." }, { status: 500 });
  }
}

// 3. PUT: Edit a transaction
export async function PUT(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, type, category, amount, description, date, reference_no, recipient_id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid transaction id" }, { status: 400 });
    }

    let parsedAmount: number | undefined = undefined;
    if (amount !== undefined) {
      parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10_000_000) {
        return NextResponse.json(
          { error: "Transaction amount must be a positive number up to 10,000,000." },
          { status: 400 }
        );
      }
    }

    if (type !== undefined && !ALLOWED_TRANSACTION_TYPES.has(type)) {
      return NextResponse.json({ error: "Transaction type must be 'income' or 'expense'." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_transactions")
      .update({
        type,
        category: category ? String(category).trim().slice(0, 100) : undefined,
        amount: parsedAmount,
        description: description ? String(description).trim().slice(0, 500) : undefined,
        date,
        reference_no: reference_no ? String(reference_no).trim().slice(0, 100) : undefined,
        recipient_id: recipient_id !== undefined ? (recipient_id ? String(recipient_id).trim() : null) : undefined,
      })
      .eq("id", id)
      .select("*, recorded_by_profile:profiles!recorded_by(full_name, email), recipient_profile:profiles!recipient_id(id, full_name, email, role)")
      .single();

    if (error) {
      console.error("[api/accountant/transactions] PUT error:", error);
      return NextResponse.json({ error: error.message || "Failed to update transaction." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[api/accountant/transactions] PUT exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process transaction edit." }, { status: 500 });
  }
}

// 4. DELETE: Remove a transaction record
export async function DELETE(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("business_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[api/accountant/transactions] DELETE error:", error);
      return NextResponse.json({ error: error.message || "Failed to delete transaction." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/accountant/transactions] DELETE exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process transaction deletion." }, { status: 500 });
  }
}
