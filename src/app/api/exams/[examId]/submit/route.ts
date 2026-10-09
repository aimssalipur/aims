import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// POST: Secure server-side grading and submission of student exam
export async function POST(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized: Please log in to submit your exam." }, { status: 401 });
    }

    const studentId = authContext.user.id;
    const body = await request.json();
    const { answers = {}, started_at } = body;

    const supabase = createAdminClient();

    // 1. Fetch exam details
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, title, duration_minutes, pass_percentage, total_marks, is_published")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // 2. Fetch all questions with their secret correct_option and explanation
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
      return NextResponse.json({ error: "Failed to grade exam: could not load question data" }, { status: 500 });
    }

    const totalQuestions = (questions || []).length;
    if (totalQuestions === 0) {
      return NextResponse.json({ error: "This exam has no questions configured yet." }, { status: 400 });
    }

    // 3. Compute score server-side & build review array
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const review = (questions || []).map((q: any) => {
      const qMarks = Number(q.marks) || 1;
      totalMarks += qMarks;

      const rawStudentAns = answers[q.id];
      const studentAns = rawStudentAns ? (String(rawStudentAns).trim().toUpperCase() as "A" | "B" | "C" | "D") : null;
      const isCorrect = Boolean(studentAns && studentAns === q.correct_option);
      const isUnanswered = !studentAns;
      const isWrong = Boolean(studentAns && studentAns !== q.correct_option);

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        score += qMarks;
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        id: q.id,
        order_index: q.order_index,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        marks: qMarks,
        student_answer: studentAns,
        correct_option: q.correct_option,
        is_correct: isCorrect,
        is_wrong: isWrong,
        is_unanswered: isUnanswered,
        explanation: q.explanation || null,
        image_url: q.image_url || null,
      };
    });

    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const passed = percentage >= (exam.pass_percentage || 50);

    const submittedAt = new Date().toISOString();
    let actualStartedAt = started_at;
    if (!actualStartedAt || isNaN(new Date(actualStartedAt).getTime())) {
      actualStartedAt = new Date(Date.now() - (exam.duration_minutes || 30) * 60 * 1000).toISOString();
    }
    const timeTakenSeconds = Math.max(
      1,
      Math.round((new Date(submittedAt).getTime() - new Date(actualStartedAt).getTime()) / 1000)
    );

    // 4. Save submission
    const { data: submission, error: subError } = await supabase
      .from("exam_submissions")
      .insert({
        exam_id: examId,
        student_id: studentId,
        answers: answers,
        score: score,
        total_marks: totalMarks,
        percentage: percentage,
        passed: passed,
        started_at: actualStartedAt,
        submitted_at: submittedAt,
        time_taken_seconds: timeTakenSeconds,
      })
      .select()
      .single();

    if (subError) {
      console.error("[api/exams/[examId]/submit] Error saving submission:", subError);
      return NextResponse.json({ error: "Failed to record exam submission." }, { status: 500 });
    }

    return NextResponse.json({
      message: passed ? "Congratulations! You passed the exam! 🎉" : "Exam submitted successfully.",
      submission_id: submission.id,
      score,
      total_marks: totalMarks,
      percentage,
      passed,
      time_taken_seconds: timeTakenSeconds,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      total_questions: totalQuestions,
      submitted_at: submission.submitted_at,
      review,
    });
  } catch (err: any) {
    console.error("[api/exams/[examId]/submit] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process exam submission" }, { status: 500 });
  }
}
