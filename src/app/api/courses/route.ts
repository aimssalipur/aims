import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[api/courses] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: courses || [] });
  } catch (err: any) {
    console.error("[api/courses] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
