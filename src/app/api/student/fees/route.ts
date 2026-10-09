import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const supabase = createAdminClient();
    const userId = authContext.user.id;

    // Fetch student's fee payment ledger records
    const { data: fees, error: feesError } = await supabase
      .from("fees_payments")
      .select("*, course:courses!course_id(id, title), verifier:profiles!verified_by(id, full_name)")
      .eq("student_id", userId)
      .order("payment_date", { ascending: false });

    if (feesError) {
      console.error("[api/student/fees] Error fetching fees:", feesError);
      return NextResponse.json({ error: feesError.message || "Failed to retrieve student fees" }, { status: 500 });
    }

    // Fetch student profile for receipt generation
    const { data: student } = await supabase
      .from("profiles")
      .select("id, full_name, email, whatsapp, course_of_interest")
      .eq("id", userId)
      .maybeSingle();

    return NextResponse.json({
      fees: fees || [],
      student: student || null,
    });
  } catch (err: any) {
    console.error("[api/student/fees] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Failed to retrieve student fees." }, { status: 500 });
  }
}
