import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/youtube";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch live class details
  const { data: liveClass, error: classError } = await supabase
    .from("live_classes")
    .select("*, courses(*)")
    .eq("id", classId)
    .single();

  if (classError || !liveClass) {
    return NextResponse.json({ error: "Live class not found" }, { status: 404 });
  }

  // 2. Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, whatsapp, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isStaff = profile.role === "admin" || profile.role === "instructor";

  // 3. If student, check enrollment
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

  // 4. Return secure credentials & live stream info
  return NextResponse.json({
    classId: liveClass.id,
    courseId: liveClass.course_id,
    courseTitle: liveClass.courses?.title || "",
    title: liveClass.title,
    roomName: liveClass.room_name,
    roomPassword: liveClass.room_password,
    youtubeUrl,
    youtubeId,
    scheduledStart: liveClass.scheduled_start,
    scheduledEnd: liveClass.scheduled_end,
    user: {
      name: profile.full_name,
      email: profile.email,
      phone: profile.whatsapp || "",
      avatar: profile.avatar_url,
      role: profile.role,
    },
  });
}
