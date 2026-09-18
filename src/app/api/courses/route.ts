import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedContext } from "@/lib/server-auth";
import dns from "node:dns";

// Ensure Node uses IPv4 first to prevent connect timeout on Windows IPv6
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where not supported
}

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

// 1. GET: List all courses with enrollment counts
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, instructor_id, youtube_playlist, created_at")
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

// 2. POST: Create a new course (Staff only: Admin or Instructor)
export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to create a course." },
        { status: 401 }
      );
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    if (!isStaff) {
      return NextResponse.json(
        { error: "Forbidden: Only instructors and administrators can add courses." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, thumbnail_url, youtube_playlist } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { error: "Course title is required." },
        { status: 400 }
      );
    }

    if (!description || !String(description).trim()) {
      return NextResponse.json(
        { error: "Course description is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify if authContext.user.id exists in profiles table for foreign key constraint
    let instructorId = authContext.user.id;
    const { data: profileCheck } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", instructorId)
      .single();

    if (!profileCheck) {
      // Fallback to any existing staff/admin profile
      const { data: fallbackProfile } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "instructor"])
        .limit(1)
        .single();

      if (fallbackProfile) {
        instructorId = fallbackProfile.id;
      }
    }

    const finalThumbnail =
      thumbnail_url?.trim() ||
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop";

    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert({
        title: String(title).trim().slice(0, 250),
        description: String(description).trim().slice(0, 2000),
        thumbnail_url: finalThumbnail,
        instructor_id: instructorId,
        youtube_playlist: youtube_playlist ? String(youtube_playlist).trim() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/courses] Course insertion error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to create course in database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { course: newCourse, message: "Course created successfully." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[api/courses] Unexpected error on POST:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process course creation." },
      { status: 500 }
    );
  }
}
