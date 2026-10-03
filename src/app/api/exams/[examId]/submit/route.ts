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
    const { answers = {} } = body;

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

    // 2. Fetch all questions with their secret correct_option
    const { data: questions, error: qError } = await supabase
      .from("exam_questions")
      .select("id, correct_option, marks")
      .eq("exam_id", examId);

    if (qError) {
      return NextResponse.json({ error: "Failed to grade exam: could not load question data" }, { status: 500 });
    }

    const totalQuestions = (questions || []).length;
    if (totalQuestions === 0) {
      return NextResponse.json({ error: "This exam has no questions configured yet." }, { status: 400 });
    }

    // 3. Compute score server-side
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    for (const q of questions || []) {
      const qMarks = Number(q.marks) || 1;
      totalMarks += qMarks;

      const studentAns = answers[q.id];
      if (!studentAns) {
        unansweredCount++;
      } else if (String(studentAns).trim().toUpperCase() === q.correct_option) {
        score += qMarks;
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const passed = percentage >= (exam.pass_percentage || 50);

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
        started_at: new Date(Date.now() - (exam.duration_minutes || 30) * 60 * 1000).toISOString(),
        submitted_at: new Date().toISOString(),
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
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      total_questions: totalQuestions,
      submitted_at: submission.submitted_at,
    });
  } catch (err: any) {
    console.error("[api/exams/[examId]/submit] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process exam submission" }, { status: 500 });
  }
}
