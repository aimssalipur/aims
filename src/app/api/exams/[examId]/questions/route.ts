import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// 1. POST: Add question to an exam (Staff only)
export async function POST(
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
      return NextResponse.json({ error: "Forbidden: Only staff can add questions" }, { status: 403 });
    }

    const body = await request.json();
    const { question_text, option_a, option_b, option_c, option_d, correct_option, marks, explanation } = body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json(
        { error: "Question statement, all 4 options (A, B, C, D), and correct answer are required." },
        { status: 400 }
      );
    }

    const upperCorrect = String(correct_option).trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(upperCorrect)) {
      return NextResponse.json(
        { error: "Correct option must be one of: A, B, C, or D." },
        { status: 400 }
      );
    }

    const questionMarks = Math.max(1, Math.min(50, Number(marks) || 1));
    const supabase = createAdminClient();

    // Get current questions count for order_index
    const { count } = await supabase
      .from("exam_questions")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId);

    const { data: newQuestion, error } = await supabase
      .from("exam_questions")
      .insert({
        exam_id: examId,
        question_text: String(question_text).trim(),
        option_a: String(option_a).trim(),
        option_b: String(option_b).trim(),
        option_c: String(option_c).trim(),
        option_d: String(option_d).trim(),
        correct_option: upperCorrect,
        marks: questionMarks,
        order_index: count || 0,
        explanation: explanation ? String(explanation).trim() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update total_marks on exam
    const { data: allQuestions } = await supabase
      .from("exam_questions")
      .select("marks")
      .eq("exam_id", examId);

    const totalMarks = (allQuestions || []).reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    await supabase.from("exams").update({ total_marks: totalMarks }).eq("id", examId);

    return NextResponse.json({ question: newQuestion, message: "Question added successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("[api/exams/[examId]/questions] POST error:", err);
    return NextResponse.json({ error: err?.message || "Failed to add question" }, { status: 500 });
  }
}

// 2. DELETE: Remove a question from an exam (Staff only)
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
      return NextResponse.json({ error: "Forbidden: Only staff can delete questions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("exam_questions")
      .delete()
      .eq("id", questionId)
      .eq("exam_id", examId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update total_marks on exam
    const { data: allQuestions } = await supabase
      .from("exam_questions")
      .select("marks")
      .eq("exam_id", examId);

    const totalMarks = (allQuestions || []).reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    await supabase.from("exams").update({ total_marks: totalMarks }).eq("id", examId);

    return NextResponse.json({ success: true, message: "Question removed successfully" });
  } catch (err: any) {
    console.error("[api/exams/[examId]/questions] DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete question" }, { status: 500 });
  }
}

// 3. PATCH: Update question
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
      return NextResponse.json({ error: "Forbidden: Only staff can edit questions" }, { status: 403 });
    }

    const body = await request.json();
    const { id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, explanation } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (question_text !== undefined) updateData.question_text = String(question_text).trim();
    if (option_a !== undefined) updateData.option_a = String(option_a).trim();
    if (option_b !== undefined) updateData.option_b = String(option_b).trim();
    if (option_c !== undefined) updateData.option_c = String(option_c).trim();
    if (option_d !== undefined) updateData.option_d = String(option_d).trim();
    if (correct_option !== undefined) {
      const upper = String(correct_option).trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(upper)) {
        return NextResponse.json({ error: "Correct option must be A, B, C, or D" }, { status: 400 });
      }
      updateData.correct_option = upper;
    }
    if (marks !== undefined) updateData.marks = Math.max(1, Math.min(50, Number(marks) || 1));
    if (explanation !== undefined) updateData.explanation = explanation ? String(explanation).trim() : null;

    const supabase = createAdminClient();
    const { data: updatedQuestion, error } = await supabase
      .from("exam_questions")
      .update(updateData)
      .eq("id", id)
      .eq("exam_id", examId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update total_marks on exam
    const { data: allQuestions } = await supabase
      .from("exam_questions")
      .select("marks")
      .eq("exam_id", examId);

    const totalMarks = (allQuestions || []).reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    await supabase.from("exams").update({ total_marks: totalMarks }).eq("id", examId);

    return NextResponse.json({ question: updatedQuestion, message: "Question updated successfully" });
  } catch (err: any) {
    console.error("[api/exams/[examId]/questions] PATCH error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update question" }, { status: 500 });
  }
}
