import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// 1. GET: Fetch announcements list
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, content, created_at, created_by, author:profiles!created_by(id, full_name, email, role, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch announcements" }, { status: 500 });
  }
}

// 2. POST: Create an announcement (Staff only)
export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: "Forbidden: Only staff can post announcements" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content || !String(title).trim() || !String(content).trim()) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: String(title).trim(),
        content: String(content).trim(),
        created_by: authContext.user.id,
      })
      .select("*, author:profiles!created_by(id, full_name, email, role, avatar_url)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ announcement: data, message: "Announcement published" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to post announcement" }, { status: 500 });
  }
}

// 3. DELETE: Delete an announcement (Staff only)
export async function DELETE(request: Request) {
  try {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete" }, { status: 500 });
  }
}
