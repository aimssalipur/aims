import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// 1. GET: Fetch exam details & questions (CRITICAL: Omit correct_option for students)
export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    const supabase = createAdminClient();

    // 1. Fetch exam
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, course_id, title, description, duration_minutes, pass_percentage, total_marks, is_published, created_at, course:courses!course_id(id, title), creator:profiles!created_by(full_name)")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // 2. Fetch questions based on role
    // For staff: return correct_option so they can view and edit
    // For students: ABSOLUTELY NEVER return correct_option in the response payload!
    let questionsQuery = supabase
      .from("exam_questions")
      .select(
        isStaff
          ? "id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index, explanation, created_at"
          : "id, exam_id, question_text, option_a, option_b, option_c, option_d, marks, order_index, created_at"
      )
      .eq("exam_id", examId)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    const { data: questions, error: questionsError } = await questionsQuery;

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    // 3. If student, also fetch their prior submission if any
    let studentSubmission = null;
    if (!isStaff) {
      const { data: sub } = await supabase
        .from("exam_submissions")
        .select("id, score, total_marks, percentage, passed, submitted_at, answers")
        .eq("exam_id", examId)
        .eq("student_id", authContext.user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      studentSubmission = sub;
    }

    return NextResponse.json({
      exam,
      questions: questions || [],
      student_submission: studentSubmission,
      is_staff: isStaff,
    });
  } catch (err: any) {
    console.error("[api/exams/[examId]] GET error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch exam details" }, { status: 500 });
  }
}

// 2. PATCH: Update exam settings (Staff only)
export async function PATCH(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
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
      return NextResponse.json({ error: "Forbidden: Only staff can edit exams" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.course_id !== undefined) updateData.course_id = body.course_id;
    if (body.duration_minutes !== undefined) updateData.duration_minutes = Math.max(5, Math.min(300, Number(body.duration_minutes)));
    if (body.pass_percentage !== undefined) updateData.pass_percentage = Math.max(1, Math.min(100, Number(body.pass_percentage)));
    if (body.is_published !== undefined) updateData.is_published = Boolean(body.is_published);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: updatedExam, error } = await supabase
      .from("exams")
      .update(updateData)
      .eq("id", examId)
      .select("*, course:courses!course_id(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exam: updatedExam, message: "Exam updated successfully" });
  } catch (err: any) {
    console.error("[api/exams/[examId]] PATCH error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update exam" }, { status: 500 });
  }
}

// 3. DELETE: Delete an exam (Staff only)
export async function DELETE(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
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
      return NextResponse.json({ error: "Forbidden: Only staff can delete exams" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", examId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Exam deleted successfully" });
  } catch (err: any) {
    console.error("[api/exams/[examId]] DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete exam" }, { status: 500 });
  }
}
