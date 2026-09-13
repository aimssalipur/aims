import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAuthenticatedContext, requireRole } from "@/lib/server-auth";
import crypto from "crypto";

// 1. GET: Fetch all scheduled live classes for a course
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  const authContext = await getAuthenticatedContext();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
  }

  const { user, roles, supabase } = authContext;
  const isStaff = roles.includes("admin") || roles.includes("instructor");

  // IDOR & Enrollment protection: If user is a student, verify enrollment in this course
  if (!isStaff) {
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json(
        { error: "Forbidden: You are not enrolled in this course." },
        { status: 403 }
      );
    }
  }

  // Fetch live classes
  const { data: liveClasses, error } = await supabase
    .from("live_classes")
    .select("*")
    .eq("course_id", courseId)
    .order("scheduled_start", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to retrieve live classes." }, { status: 500 });
  }

  return NextResponse.json(liveClasses);
}

// 2. POST: Schedule a new live class (Staff only)
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  const { context, errorResponse } = await requireRole(["admin", "instructor"]);
  if (errorResponse) return errorResponse;

  const { supabase } = context;

  try {
    const body = await request.json();
    const { title, scheduled_start, scheduled_end } = body;

    if (!title || !scheduled_start || !scheduled_end) {
      return NextResponse.json(
        { error: "Missing required fields: title, scheduled_start, scheduled_end" },
        { status: 400 }
      );
    }

    // Generate cryptographically secure randomized Room Name and Password
    const roomName = `aims-class-${crypto.randomUUID()}`;
    const roomPassword = crypto.randomBytes(4).toString("hex").toUpperCase();

    const { data: newClass, error: insertError } = await supabase
      .from("live_classes")
      .insert({
        course_id: courseId,
        title: String(title).trim().slice(0, 200),
        room_name: roomName,
        room_password: roomPassword,
        scheduled_start,
        scheduled_end,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to schedule live class." }, { status: 500 });
    }

    return NextResponse.json(newClass);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process live class request." }, { status: 500 });
  }
}
