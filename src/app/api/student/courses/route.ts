import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const userId = authContext.user.id;

    // 1. Fetch student's real enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, progress, enrolled_at, course:courses(id, title, description, thumbnail_url, instructor_id, youtube_playlist, created_at, instructor:profiles!instructor_id(id, full_name, email, avatar_url))")
      .eq("student_id", userId)
      .order("enrolled_at", { ascending: false });

    if (enrollError) {
      console.error("[api/student/courses] Enrollment fetch error:", enrollError);
    }

    const enrolledCourses = (enrollments || [])
      .filter((e) => e.course)
      .map((e) => ({
        ...(e.course as any),
        enrollment_id: e.id,
        progress: e.progress || 0,
        enrolled_at: e.enrolled_at,
        is_enrolled: true,
      }));

    // 2. Fetch all available courses in case student wants to browse
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, instructor_id, youtube_playlist, created_at, instructor:profiles!instructor_id(id, full_name, email, avatar_url)")
      .order("created_at", { ascending: true });

    return NextResponse.json({
      enrolledCourses,
      allCourses: allCourses || [],
    });
  } catch (err: any) {
    console.error("[api/student/courses] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch student courses" }, { status: 500 });
  }
}
