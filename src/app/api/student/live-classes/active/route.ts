import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";
import { extractYouTubeId } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ activeClass: null });
    }

    const { user, roles, supabase: userSupabase } = authContext;
    const isStaff = roles.includes("admin") || roles.includes("instructor");
    
    // Prefer admin client to bypass RLS, fallback to user authenticated supabase
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = userSupabase;
    }

    let courseIds: string[] = [];

    if (!isStaff) {
      // Fetch student's real enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (enrollError) {
        console.error("[api/student/live-classes/active] Error fetching student enrollments:", enrollError);
      }

      courseIds = (enrollments || []).map((e: any) => e.course_id);

      // Student is not enrolled in any course -> no active live classes for them
      if (courseIds.length === 0) {
        return NextResponse.json({ activeClass: null });
      }
    }

    // Look for classes scheduled around now:
    // Window: start time from 24 hours ago up to 3 hours in the future
    const now = new Date();
    const windowStartThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const windowEndThreshold = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("live_classes")
      .select("id, title, course_id, scheduled_start, scheduled_end, room_password, courses!course_id(id, title)")
      .gte("scheduled_start", windowStartThreshold)
      .lte("scheduled_start", windowEndThreshold)
      .order("scheduled_start", { ascending: false });

    if (!isStaff && courseIds.length > 0) {
      query = query.in("course_id", courseIds);
    }

    let { data: classes, error } = await query;

    // Fallback if courses!course_id foreign key alias fails
    if (error) {
      console.warn("[api/student/live-classes/active] Primary query failed, attempting simple select fallback:", error.message);
      let fallbackQuery = supabase
        .from("live_classes")
        .select("id, title, course_id, scheduled_start, scheduled_end, room_password")
        .gte("scheduled_start", windowStartThreshold)
        .lte("scheduled_start", windowEndThreshold)
        .order("scheduled_start", { ascending: false });

      if (!isStaff && courseIds.length > 0) {
        fallbackQuery = fallbackQuery.in("course_id", courseIds);
      }

      const fallbackResult = await fallbackQuery;
      classes = fallbackResult.data || [];
    }

    if (!classes || classes.length === 0) {
      return NextResponse.json({ activeClass: null });
    }

    // Determine which class is currently live
    const nowTime = now.getTime();
    const activeClass = classes.find((cls: any) => {
      const start = new Date(cls.scheduled_start).getTime();
      let end = new Date(cls.scheduled_end).getTime();
      
      // Default duration is at least 90 minutes if invalid or equal to start
      if (isNaN(end) || end <= start) {
        end = start + 90 * 60 * 1000;
      }
      
      // Allow joining from 30 mins before scheduled start up to 45 mins after scheduled end
      const windowOpen = start - 30 * 60 * 1000;
      const windowClose = end + 45 * 60 * 1000;
      const isWithinTimeWindow = nowTime >= windowOpen && nowTime <= windowClose;

      if (isWithinTimeWindow) {
        return true;
      }

      // If instructor has linked an active stream and scheduled time was within 8 hours
      const hasActiveStream = Boolean(cls.room_password && extractYouTubeId(cls.room_password));
      if (hasActiveStream && Math.abs(nowTime - start) <= 8 * 60 * 60 * 1000) {
        return true;
      }

      return false;
    });

    if (!activeClass) {
      return NextResponse.json({ activeClass: null });
    }

    const courseTitle =
      (activeClass.courses as any)?.title ||
      (activeClass.course as any)?.title ||
      "Live Lecture";

    return NextResponse.json({
      activeClass: {
        id: activeClass.id,
        title: activeClass.title,
        course_id: activeClass.course_id,
        course_title: courseTitle,
        scheduled_start: activeClass.scheduled_start,
        scheduled_end: activeClass.scheduled_end,
      },
    });
  } catch (err: any) {
    console.error("[api/student/live-classes/active] Unexpected error:", err);
    return NextResponse.json({ activeClass: null });
  }
}
