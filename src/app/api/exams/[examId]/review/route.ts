import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// GET: Fetch student review & answer explanations for a completed exam
export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized: Please log in to review your exam." }, { status: 401 });
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submission_id");

    const supabase = createAdminClient();

    // 1. Fetch exam metadata
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, title, description, duration_minutes, pass_percentage, total_marks, is_published, course:courses!course_id(id, title)")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // 2. Fetch the submission
    let subQuery = supabase
      .from("exam_submissions")
      .select("id, student_id, answers, score, total_marks, percentage, passed, started_at, submitted_at, time_taken_seconds")
      .eq("exam_id", examId);

    if (submissionId) {
      subQuery = subQuery.eq("id", submissionId);
      if (!isStaff) {
        subQuery = subQuery.eq("student_id", authContext.user.id);
      }
    } else {
      if (!isStaff) {
        subQuery = subQuery
          .eq("student_id", authContext.user.id)
          .order("submitted_at", { ascending: false })
          .limit(1);
      } else {
        subQuery = subQuery.order("submitted_at", { ascending: false }).limit(1);
      }
    }

    const { data: submission, error: subError } = await subQuery.maybeSingle();

    if (subError) {
      console.error("[api/exams/[examId]/review] Submission fetch error:", subError);
      return NextResponse.json({ error: "Failed to load submission data" }, { status: 500 });
    }

    if (!submission) {
      return NextResponse.json(
        { error: "No completed submission found for this exam. You must complete the exam first." },
        { status: 404 }
      );
    }

    // 3. Fetch questions with correct_option and explanation
    let questionsQuery = supabase
      .from("exam_questions")
      .select("id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option, marks, explanation, image_url, created_at")
      .eq("exam_id", examId)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    let firstResult = await questionsQuery;
    let questions = firstResult.data as any;
    let qError = firstResult.error;

    if (qError && qError.code === "42703") {
      const fallbackResult = await supabase
        .from("exam_questions")
        .select("id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option, marks, explanation, created_at")
        .eq("exam_id", examId)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });
      questions = fallbackResult.data as any;
      qError = fallbackResult.error;
    }

    if (qError) {
      console.error("[api/exams/[examId]/review] Questions error:", qError);
      return NextResponse.json({ error: "Failed to load exam questions" }, { status: 500 });
    }

    const answers = (submission.answers || {}) as Record<string, string>;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const review = (questions || []).map((q: any) => {
      const rawAns = answers[q.id];
      const studentAns = rawAns ? (String(rawAns).trim().toUpperCase() as "A" | "B" | "C" | "D") : null;
      const isCorrect = Boolean(studentAns && studentAns === q.correct_option);
      const isUnanswered = !studentAns;
      const isWrong = Boolean(studentAns && studentAns !== q.correct_option);

      if (isCorrect) correctCount++;
      else if (isWrong) wrongCount++;
      else unansweredCount++;

      return {
        id: q.id,
        order_index: q.order_index,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        marks: Number(q.marks) || 1,
        student_answer: studentAns,
        correct_option: q.correct_option,
        is_correct: isCorrect,
        is_wrong: isWrong,
        is_unanswered: isUnanswered,
        explanation: q.explanation || null,
        image_url: q.image_url || null,
      };
    });

    return NextResponse.json({
      exam,
      submission: {
        id: submission.id,
        score: submission.score,
        total_marks: submission.total_marks,
        percentage: submission.percentage,
        passed: submission.passed,
        submitted_at: submission.submitted_at,
        time_taken_seconds: submission.time_taken_seconds,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        total_questions: (questions || []).length,
      },
      review,
    });
  } catch (err: any) {
    console.error("[api/exams/[examId]/review] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
