import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// 1. GET: List enrollments
export async function GET(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "instructor", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const courseId = searchParams.get("course_id");

    const supabase = createAdminClient();
    let query = supabase
      .from("enrollments")
      .select("id, student_id, course_id, enrolled_at, progress, student:profiles!student_id(id, full_name, email, whatsapp, role), course:courses!course_id(id, title)")
      .order("enrolled_at", { ascending: false });

    if (studentId) query = query.eq("student_id", studentId);
    if (courseId) query = query.eq("course_id", courseId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch enrollments." }, { status: 500 });
  }
}

// 2. POST: Assign / Enroll student in a course
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "instructor", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { student_id, course_id } = body;

    if (!student_id || !course_id) {
      return NextResponse.json(
        { error: "Both student_id and course_id are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student_id)
      .eq("course_id", course_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { message: `${student.full_name} is already enrolled in ${course.title}.`, enrollment: existing },
        { status: 200 }
      );
    }

    const { data: enrollment, error: insertError } = await supabase
      .from("enrollments")
      .insert({
        student_id,
        course_id,
        progress: 0,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: `Successfully enrolled ${student.full_name} in ${course.title}.`, enrollment },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to enroll student." }, { status: 500 });
  }
}

// 3. DELETE: Unenroll student
export async function DELETE(request: Request) {
  const { context, errorResponse } = await requireRole(["admin", "instructor"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("id");
    const studentId = searchParams.get("student_id");
    const courseId = searchParams.get("course_id");

    const supabase = createAdminClient();
    let query = supabase.from("enrollments").delete();

    if (enrollmentId) {
      query = query.eq("id", enrollmentId);
    } else if (studentId && courseId) {
      query = query.eq("student_id", studentId).eq("course_id", courseId);
    } else {
      return NextResponse.json({ error: "Missing enrollment ID or student_id and course_id." }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Enrollment removed successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to remove enrollment." }, { status: 500 });
  }
}
