import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedContext } from "@/lib/server-auth";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore
}

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

// 1. PATCH: Update an existing course (Title, Description, Thumbnail, YouTube playlist)
export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    if (!isStaff) {
      return NextResponse.json(
        { error: "Forbidden: Only instructors and administrators can edit courses." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = String(body.thumbnail_url).trim();
    if (body.youtube_playlist !== undefined) updateData.youtube_playlist = body.youtube_playlist ? String(body.youtube_playlist).trim() : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided for update." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", courseId)
      .select()
      .single();

    if (error) {
      console.error("[api/courses/[courseId]] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      course: updatedCourse,
      message: "Course updated successfully.",
    });
  } catch (err: any) {
    console.error("[api/courses/[courseId]] Unexpected error on PATCH:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update course." },
      { status: 500 }
    );
  }
}

// 2. DELETE: Delete a course
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    const isStaff =
      authContext.roles.includes("admin") ||
      authContext.roles.includes("instructor") ||
      authContext.primaryRole === "admin" ||
      authContext.primaryRole === "instructor";

    if (!isStaff) {
      return NextResponse.json(
        { error: "Forbidden: Only instructors and administrators can delete courses." },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      console.error("[api/courses/[courseId]] Deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (err: any) {
    console.error("[api/courses/[courseId]] Unexpected error on DELETE:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete course." },
      { status: 500 }
    );
  }
}
