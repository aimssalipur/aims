import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context, errorResponse } = await requireRole(["admin", "accountant"]);
  if (errorResponse) return errorResponse;

  try {
    const supabaseAdmin = createAdminClient();

    // Retrieve all active profiles with their assigned user_roles
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, user_roles(role)")
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to retrieve staff profiles." },
        { status: 500 }
      );
    }

    // Filter to users who have staff/admin/accountant/instructor roles
    const staffRoleSet = new Set(["admin", "instructor", "accountant"]);

    const staffMembers = (profiles || [])
      .filter((p: any) => {
        const roles: string[] = p.user_roles?.map((ur: any) => ur.role) || [p.role];
        return roles.some((r) => staffRoleSet.has(r)) || staffRoleSet.has(p.role);
      })
      .map((p: any) => {
        const assignedRoles: string[] = Array.from(
          new Set([...(p.user_roles?.map((ur: any) => ur.role) || []), p.role])
        ).filter(Boolean);

        return {
          id: p.id,
          full_name: p.full_name || "Unnamed Staff",
          email: p.email,
          primaryRole: p.role,
          roles: assignedRoles.length > 0 ? assignedRoles : [p.role],
        };
      });

    return NextResponse.json(staffMembers);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch staff members." },
      { status: 500 }
    );
  }
}
