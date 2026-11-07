import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { error: "Forbidden: Only staff can bulk import questions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawQuestions = Array.isArray(body?.questions)
      ? body.questions
      : Array.isArray(body)
      ? body
      : [];

    if (!rawQuestions || rawQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided for import. Expected an array of questions." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify exam exists
    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .select("id, title")
      .eq("id", examId)
      .single();

    if (examErr || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Get current question count for order_index
    const { count: currentCount } = await supabase
      .from("exam_questions")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId);

    let startOrder = currentCount || 0;

    // Validate and format items
    const validRows: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      const qText = String(q.question_text || q.question || "").trim();
      const optA = String(q.option_a || q.A || q.a || "").trim();
      const optB = String(q.option_b || q.B || q.b || "").trim();
      const optC = String(q.option_c || q.C || q.c || "").trim();
      const optD = String(q.option_d || q.D || q.d || "").trim();

      let correct = String(q.correct_option || q.answer || q.correctAnswer || "A")
        .trim()
        .toUpperCase();

      if (correct.startsWith("(") && correct.length >= 2) {
        correct = correct.charAt(1).toUpperCase();
      } else if (correct.length > 1) {
        correct = correct.charAt(0).toUpperCase();
      }

      if (!["A", "B", "C", "D"].includes(correct)) {
        correct = "A";
      }

      if (!qText || !optA || !optB || !optC || !optD) {
        errors.push(`Item #${i + 1} skipped: missing question text or options.`);
        continue;
      }

      const marks = Math.max(1, Math.min(50, Number(q.marks) || 1));
      const explanation = q.explanation || q.rationale
        ? String(q.explanation || q.rationale).replace(/[\s\u2e3b\u2014\u2013-]+$/, "").trim()
        : null;

      validRows.push({
        exam_id: examId,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: correct,
        marks,
        order_index: startOrder + validRows.length,
        explanation,
        image_url: q.image_url ? String(q.image_url).trim() : null,
      });
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid questions could be formatted.", details: errors },
        { status: 400 }
      );
    }

    // Insert in batches of 25
    const BATCH_SIZE = 25;
    let inserted = 0;

    for (let b = 0; b < validRows.length; b += BATCH_SIZE) {
      const slice = validRows.slice(b, b + BATCH_SIZE);
      let { error: insertErr } = await supabase.from("exam_questions").insert(slice);

      // Fallback if image_url column error occurs
      if (insertErr && insertErr.code === "42703") {
        const fallbackSlice = slice.map(({ image_url, ...rest }) => rest);
        const retryResult = await supabase.from("exam_questions").insert(fallbackSlice);
        insertErr = retryResult.error;
      }

      if (insertErr) {
        console.error("[bulk-questions] Batch insert error:", insertErr);
        return NextResponse.json(
          { error: `Database error on batch: ${insertErr.message}`, imported_so_far: inserted },
          { status: 500 }
        );
      }
      inserted += slice.length;
    }

    // Recalculate total_marks on exam
    const { data: allQuestions } = await supabase
      .from("exam_questions")
      .select("marks")
      .eq("exam_id", examId);

    const totalMarks = (allQuestions || []).reduce(
      (sum, q) => sum + (Number(q.marks) || 1),
      0
    );

    await supabase
      .from("exams")
      .update({ total_marks: totalMarks })
      .eq("id", examId);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${inserted} questions!`,
      imported_count: inserted,
      total_marks: totalMarks,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[bulk-questions] POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to bulk import questions" },
      { status: 500 }
    );
  }
}

