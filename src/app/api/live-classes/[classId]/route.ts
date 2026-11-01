import { NextResponse } from "next/server";
import { getAuthenticatedContext, requireRole } from "@/lib/server-auth";
import { extractYouTubeId } from "@/lib/youtube";

// 1. GET: Fetch live class details with access validation
export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  const authContext = await getAuthenticatedContext();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
  }

  const { user, roles, supabase } = authContext;
  const isStaff = roles.includes("admin") || roles.includes("instructor");

  const { data: liveClass, error: classError } = await supabase
    .from("live_classes")
    .select("*, courses(id, title)")
    .eq("id", classId)
    .single();

  if (classError || !liveClass) {
    return NextResponse.json({ error: "Live class not found." }, { status: 404 });
  }

  // If student, verify course enrollment
  if (!isStaff) {
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", liveClass.course_id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json(
        { error: "Forbidden: You are not enrolled in this course." },
        { status: 403 }
      );
    }
  }

  const youtubeUrl = liveClass.room_password || "";
  const youtubeId = extractYouTubeId(youtubeUrl);

  return NextResponse.json({
    classId: liveClass.id,
    courseId: liveClass.course_id,
    courseTitle: liveClass.courses?.title || "",
    title: liveClass.title,
    roomName: liveClass.room_name,
    youtubeUrl,
    youtubeId,
    scheduledStart: liveClass.scheduled_start,
    scheduledEnd: liveClass.scheduled_end,
  });
}

// 2. PATCH: Update live class stream URL or details (Staff only)
export async function PATCH(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  const { context, errorResponse } = await requireRole(["admin", "instructor"]);
  if (errorResponse) return errorResponse;

  const { supabase } = context;

  try {
    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) {
      updateData.title = String(body.title).trim().slice(0, 200);
    }

    if (body.scheduled_start !== undefined) {
      updateData.scheduled_start = body.scheduled_start;
    }

    if (body.scheduled_end !== undefined) {
      updateData.scheduled_end = body.scheduled_end;
    }

    // youtube_url is stored in room_password
    if (body.youtube_url !== undefined) {
      updateData.room_password = String(body.youtube_url).trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }

    const { data: updatedClass, error: updateError } = await supabase
      .from("live_classes")
      .update(updateData)
      .eq("id", classId)
      .select()
      .single();

    if (updateError) {
      console.error("[api/live-classes/[classId]] PATCH error:", updateError);
      return NextResponse.json({ error: "Failed to update live class." }, { status: 500 });
    }

    const youtubeUrl = updatedClass.room_password || "";
    const youtubeId = extractYouTubeId(youtubeUrl);

    return NextResponse.json({
      success: true,
      liveClass: {
        ...updatedClass,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
      },
    });
  } catch (err: any) {
    console.error("[api/live-classes/[classId]] Unexpected error on PATCH:", err);
    return NextResponse.json({ error: "Failed to process update request." }, { status: 500 });
  }
}

// 3. DELETE: Delete live class (Staff only)
export async function DELETE(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  const { context, errorResponse } = await requireRole(["admin", "instructor"]);
  if (errorResponse) return errorResponse;

  const { supabase } = context;

  try {
    const { error: deleteError } = await supabase
      .from("live_classes")
      .delete()
      .eq("id", classId);

    if (deleteError) {
      console.error("[api/live-classes/[classId]] DELETE error:", deleteError);
      return NextResponse.json({ error: "Failed to delete live class." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/live-classes/[classId]] Unexpected error on DELETE:", err);
    return NextResponse.json({ error: "Failed to process live class deletion." }, { status: 500 });
  }
}

