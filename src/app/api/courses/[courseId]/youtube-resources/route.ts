import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAuthenticatedContext, requireRole } from "@/lib/server-auth";

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{6,20}(\?.*|&.*)?$/;

// 1. GET: Fetch all YouTube resources for a course
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

  // Enrollment check: if user is student, verify they are enrolled in this course
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

  // Fetch YouTube resources
  const { data: resources, error } = await supabase
    .from("youtube_resources")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to retrieve YouTube resources." }, { status: 500 });
  }

  return NextResponse.json(resources);
}

// 2. POST: Add a new YouTube resource link
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
    const { title, youtube_url, description } = body;

    if (!title || !youtube_url) {
      return NextResponse.json(
        { error: "Missing required fields: title, youtube_url" },
        { status: 400 }
      );
    }

    const trimmedUrl = String(youtube_url).trim();
    if (!YOUTUBE_URL_REGEX.test(trimmedUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a valid youtube.com or youtu.be video link." },
        { status: 400 }
      );
    }

    const { data: newResource, error: insertError } = await supabase
      .from("youtube_resources")
      .insert({
        course_id: courseId,
        title: String(title).trim().slice(0, 200),
        youtube_url: trimmedUrl,
        description: description ? String(description).trim().slice(0, 500) : "",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to add YouTube resource." }, { status: 500 });
    }

    return NextResponse.json(newResource);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process YouTube resource creation." }, { status: 500 });
  }
}

// 3. DELETE: Remove a YouTube resource link
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  const { context, errorResponse } = await requireRole(["admin", "instructor"]);
  if (errorResponse) return errorResponse;

  const { supabase } = context;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing query parameter: id" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("youtube_resources")
      .delete()
      .eq("id", id)
      .eq("course_id", courseId);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process deletion." }, { status: 500 });
  }
}
