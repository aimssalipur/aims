import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// 1. GET: List exams (optionally by course)
export async function GET(request: Request) {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    const supabase = createAdminClient();

    let query = supabase
      .from("exams")
      .select("id, course_id, title, description, duration_minutes, pass_percentage, total_marks, is_published, created_at, course:courses!course_id(id, title), creator:profiles!created_by(full_name)")
      .order("created_at", { ascending: false });

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    if (!isStaff) {
      // Students only see published exams
      query = query.eq("is_published", true);
    }

    const { data: exams, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach questions count and student submission if student
    const examsWithMeta = await Promise.all(
      (exams || []).map(async (exam) => {
        const { count: questionsCount } = await supabase
          .from("exam_questions")
          .select("id", { count: "exact", head: true })
          .eq("exam_id", exam.id);

        let userSubmission = null;
        if (!isStaff) {
          const { data: submission } = await supabase
            .from("exam_submissions")
            .select("id, score, total_marks, percentage, passed, submitted_at")
            .eq("exam_id", exam.id)
            .eq("student_id", authContext.user.id)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          userSubmission = submission;
        }

        return {
          ...exam,
          questions_count: questionsCount || 0,
          user_submission: userSubmission,
        };
      })
    );

    return NextResponse.json(examsWithMeta);
  } catch (err: any) {
    console.error("[api/exams] GET error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch exams" }, { status: 500 });
  }
}

// 2. POST: Create a new exam (Staff only)
export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    if (!isStaff) {
      return NextResponse.json({ error: "Forbidden: Only staff can create exams" }, { status: 403 });
    }

    const body = await request.json();
    const { course_id, title, description, duration_minutes, pass_percentage, is_published } = body;

    if (!course_id || !title || !String(title).trim()) {
      return NextResponse.json(
        { error: "Course and exam title are required." },
        { status: 400 }
      );
    }

    const duration = Math.max(5, Math.min(300, Number(duration_minutes) || 30));
    const passPerc = Math.max(1, Math.min(100, Number(pass_percentage) || 50));

    const supabase = createAdminClient();

    const { data: newExam, error } = await supabase
      .from("exams")
      .insert({
        course_id,
        title: String(title).trim().slice(0, 250),
        description: description ? String(description).trim().slice(0, 1500) : null,
        duration_minutes: duration,
        pass_percentage: passPerc,
        total_marks: 0,
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        created_by: authContext.user.id,
      })
      .select("*, course:courses!course_id(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exam: newExam, message: "Exam created successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("[api/exams] POST error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create exam" }, { status: 500 });
  }
}
