import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

const ALLOWED_TRANSACTION_TYPES = new Set(["income", "expense"]);

// 1. GET: Fetch transactions
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const supabase = createClient();
  let query = supabase
    .from("business_transactions")
    .select("*, recorded_by_profile:profiles!recorded_by(full_name, email)")
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
    return NextResponse.json({ error: "Failed to retrieve transactions." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 2. POST: Record a new transaction
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { type, category, amount, description, date, reference_no } = body;

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

    const supabase = createClient();
    const { data, error } = await supabase
      .from("business_transactions")
      .insert({
        type,
        category: String(category).trim().slice(0, 100),
        amount: parsedAmount,
        description: String(description).trim().slice(0, 500),
        date: date || new Date().toISOString(),
        reference_no: reference_no ? String(reference_no).trim().slice(0, 100) : null,
        recorded_by: context.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create transaction record." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process transaction." }, { status: 500 });
  }
}

// 3. PUT: Edit a transaction
export async function PUT(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, type, category, amount, description, date, reference_no } = body;

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

    const supabase = createClient();
    const { data, error } = await supabase
      .from("business_transactions")
      .update({
        type,
        category: category ? String(category).trim().slice(0, 100) : undefined,
        amount: parsedAmount,
        description: description ? String(description).trim().slice(0, 500) : undefined,
        date,
        reference_no: reference_no ? String(reference_no).trim().slice(0, 100) : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update transaction." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process transaction edit." }, { status: 500 });
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

    const supabase = createClient();
    const { error } = await supabase
      .from("business_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete transaction." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process transaction deletion." }, { status: 500 });
  }
}
