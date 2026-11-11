import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// Known course mappings from the catalog keys to course search keywords or UUIDs
const COURSE_KEY_MAPPINGS: Record<string, { id?: string; keyword: string }> = {
  course_1: { id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", keyword: "OSSSC Nursing Officer" },
  course_2: { id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", keyword: "AIIMS NORCET" },
  course_3: { id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", keyword: "ESIC Nursing" },
  course_4: { id: "c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4", keyword: "MNS Entrance" },
  course_5: { id: "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5", keyword: "RRB Railway" },
  course_6: { id: "c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6", keyword: "OJEE Nursing" },
  course_7: { id: "c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7", keyword: "Lecturer" },
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, title, thumbnail_url")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build key-to-thumbnail map based on database state
    const courseImages: Record<string, string> = {};
    for (const [key, mapping] of Object.entries(COURSE_KEY_MAPPINGS)) {
      const match = courses?.find(
        (c) => (mapping.id && c.id === mapping.id) || c.title.toLowerCase().includes(mapping.keyword.toLowerCase())
      );
      if (match?.thumbnail_url) {
        courseImages[key] = match.thumbnail_url;
      }
    }

    return NextResponse.json({
      courses: courses || [],
      courseImages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch media data" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Forbidden: Admin or staff access required" }, { status: 403 });
    }

    const body = await request.json();
    const { images } = body;

    if (!images || typeof images !== "object") {
      return NextResponse.json({ error: "Invalid images payload" }, { status: 400 });
    }

    const supabase = createAdminClient();
    let updatedCount = 0;

    // Fetch existing courses to map accurately
    const { data: existingCourses } = await supabase
      .from("courses")
      .select("id, title");

    for (const [key, rawUrl] of Object.entries(images)) {
      const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

      // Sync course covers directly to the database
      if (key.startsWith("course_")) {
        const mapping = COURSE_KEY_MAPPINGS[key];
        let targetId = mapping?.id;

        if (!targetId && existingCourses && mapping) {
          const match = existingCourses.find((c) =>
            c.title.toLowerCase().includes(mapping.keyword.toLowerCase())
          );
          if (match) targetId = match.id;
        }

        if (targetId) {
          const { error: updateErr } = await supabase
            .from("courses")
            .update({ thumbnail_url: url.includes("unsplash.com") ? "" : url })
            .eq("id", targetId);

          if (!updateErr) updatedCount++;
        }
      } else if (existingCourses && existingCourses.some((c) => c.id === key)) {
        // Direct course UUID update
        const { error: updateErr } = await supabase
          .from("courses")
          .update({ thumbnail_url: url.includes("unsplash.com") ? "" : url })
          .eq("id", key);

        if (!updateErr) updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved frontend images and synchronized ${updatedCount} courses to the database.`,
      updatedCount,
    });
  } catch (err: any) {
    console.error("[api/admin/media] Error saving media:", err);
    return NextResponse.json({ error: err.message || "Failed to save media changes" }, { status: 500 });
  }
}

