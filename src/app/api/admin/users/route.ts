import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_ROLES = new Set(["admin", "student", "instructor", "accountant"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. GET: Fetch all user profiles with their roles
export async function GET() {
  const { context, errorResponse } = await requireRole(["admin"]);
  if (errorResponse) return errorResponse;

  const supabaseAdmin = createAdminClient();
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*, user_roles(role)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to retrieve user profiles." }, { status: 500 });
  }

  // Format profiles to include roles array
  const formattedProfiles = profiles.map((p: any) => ({
    ...p,
    roles: p.user_roles?.map((ur: any) => ur.role) || [p.role],
  }));

  return NextResponse.json(formattedProfiles);
}

// 2. POST: Create a new user (with Auth and Profile)
export async function POST(request: Request) {
  const { context, errorResponse } = await requireRole(["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { email, password, fullName, phone, role, course } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, fullName, role" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(fullName).trim();
    const trimmedRole = String(role).trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    if (!VALID_ROLES.has(trimmedRole)) {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Create user in Supabase Auth (emails are confirmed automatically to allow direct logging in)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name: trimmedName.slice(0, 100),
          phone: String(phone || "").trim().slice(0, 20),
          course: String(course || "").trim().slice(0, 200),
          role: trimmedRole,
          approved: true, // Manual creations by admin are approved immediately
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Wait 500ms to allow the DB trigger to finish inserting the profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch and return the newly created profile with roles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", authData.user.id)
      .single();

    if (profile) {
      profile.roles = profile.user_roles?.map((ur: any) => ur.role) || [profile.role];
    }

    return NextResponse.json(profile || authData.user);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process user creation." },
      { status: 500 }
    );
  }
}

// 3. PUT: Update user roles (multi-role support)
export async function PUT(request: Request) {
  const { context, errorResponse } = await requireRole(["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, roles, approved } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid required field: id" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Update approved status if provided
    if (approved !== undefined) {
      const isApproved = Boolean(approved);
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ approved: isApproved })
        .eq("id", id);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      // Sync auth metadata approved flag
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { approved: isApproved },
      });

      // If approving user, ensure they have at least one active role in user_roles and profiles
      if (isApproved) {
        const { data: existingRoles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", id);

        if (!existingRoles || existingRoles.length === 0) {
          await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: id, role: "student" });

          await supabaseAdmin
            .from("profiles")
            .update({ role: "student" })
            .eq("id", id);

          await supabaseAdmin.auth.admin.updateUserById(id, {
            user_metadata: { role: "student", approved: true },
          });
        }
      }
    }

    // 2. Update roles if provided
    if (roles !== undefined) {
      if (!Array.isArray(roles) || roles.length === 0) {
        return NextResponse.json(
          { error: "roles must be a non-empty array" },
          { status: 400 }
        );
      }

      // Validate each role
      for (const r of roles) {
        if (!VALID_ROLES.has(r)) {
          return NextResponse.json(
            { error: `Invalid role: ${r}. Allowed: admin, student, instructor, accountant` },
            { status: 400 }
          );
        }
      }

      // 1. Delete current roles in user_roles
      const { error: deleteError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      // 2. Insert new roles
      const rolesToInsert = roles.map((role: string) => ({
        user_id: id,
        role,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert(rolesToInsert);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // 3. Set the default/active role in profiles to the first selected role
      const activeRole = roles[0];
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: activeRole })
        .eq("id", id);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      // 4. Update role in auth user metadata for consistency
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { role: activeRole },
      });
    }

    // Fetch and return updated profile with roles
    const { data: updatedProfile, error: getError } = await supabaseAdmin
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", id)
      .single();

    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 500 });
    }

    if (updatedProfile) {
      updatedProfile.roles = updatedProfile.user_roles?.map((ur: any) => ur.role) || [updatedProfile.role];
    }

    return NextResponse.json(updatedProfile);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update user profile or roles." },
      { status: 500 }
    );
  }
}

// 4. DELETE: Terminate user account
export async function DELETE(request: Request) {
  const { context, errorResponse } = await requireRole(["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    // Prevent accidental self-deletion of active admin account
    if (id === context.user.id) {
      return NextResponse.json(
        { error: "Security restriction: You cannot delete your own active administrator account." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete user account." },
      { status: 500 }
    );
  }
}
