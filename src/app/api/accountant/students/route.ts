import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const supabase = createAdminClient();
    // Query users with student profiles (role = student or all non-staff)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, whatsapp, course_of_interest, role, avatar_url")
      .in("role", ["student", "user"])
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch students list." }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
