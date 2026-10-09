import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// GET: Fetch all student submissions for a specific exam (Staff only)
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

    if (!isStaff) {
      return NextResponse.json(
        { error: "Forbidden: Only staff can view student exam results" },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch exam metadata
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, title, duration_minutes, pass_percentage, total_marks")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // 2. Fetch submissions joined with student profile
    const { data: rawSubmissions, error: subError } = await supabase
      .from("exam_submissions")
      .select(`
        id,
        exam_id,
        student_id,
        answers,
        score,
        total_marks,
        percentage,
        passed,
        started_at,
        submitted_at,
        student:profiles!student_id(
          id,
          full_name,
          email,
          whatsapp,
          avatar_url
        )
      `)
      .eq("exam_id", examId)
      .order("submitted_at", { ascending: false });

    if (subError) {
      console.error("[api/exams/[examId]/submissions] Fetch error:", subError);
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    // Safely attach calculated time_taken_seconds from started_at and submitted_at
    const submissions = (rawSubmissions || []).map((s: any) => {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.submitted_at).getTime();
      const durationSec = Math.max(1, Math.round((end - start) / 1000));
      return {
        ...s,
        time_taken_seconds: s.time_taken_seconds || durationSec,
      };
    });

    // Calculate aggregated metrics
    const totalSubmissions = submissions.length;
    const passedCount = submissions.filter((s: any) => s.passed).length;
    const passRate =
      totalSubmissions > 0
        ? Math.round((passedCount / totalSubmissions) * 100)
        : 0;

    const avgScore =
      totalSubmissions > 0
        ? Number(
            (
              submissions.reduce((sum: number, s: any) => sum + Number(s.score || 0), 0) /
              totalSubmissions
            ).toFixed(1)
          )
        : 0;

    const avgTimeTakenSec =
      totalSubmissions > 0
        ? Math.round(
            submissions.reduce((sum: number, s: any) => sum + Number(s.time_taken_seconds || 1), 0) /
              totalSubmissions
          )
        : 0;

    return NextResponse.json({
      exam,
      submissions: submissions || [],
      stats: {
        total_submissions: totalSubmissions,
        passed_count: passedCount,
        failed_count: totalSubmissions - passedCount,
        pass_rate: passRate,
        avg_score: avgScore,
        avg_time_taken_seconds: avgTimeTakenSec,
      },
    });
  } catch (err: any) {
    console.error("[api/exams/[examId]/submissions] GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch student submissions" },
      { status: 500 }
    );
  }
}
