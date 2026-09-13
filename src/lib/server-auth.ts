import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { UserRole, Profile } from "@/lib/types";

export interface AuthenticatedContext {
  user: any;
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: UserRole;
  supabase: ReturnType<typeof createClient>;
}

/**
 * Resolves the authenticated user, their canonical profile, and all assigned roles.
 * Checks both `profiles.role` and `user_roles.role` to ensure complete authorization consistency.
 */
export async function getAuthenticatedContext(): Promise<AuthenticatedContext | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // 1. Fetch user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Fetch user's multi-role mappings
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const rolesSet = new Set<UserRole>();

    if (profile?.role) {
      rolesSet.add(profile.role as UserRole);
    }

    if (userRoles && Array.isArray(userRoles)) {
      for (const ur of userRoles) {
        if (ur.role) {
          rolesSet.add(ur.role as UserRole);
        }
      }
    }

    // Default fallback role
    if (rolesSet.size === 0) {
      rolesSet.add("student");
    }

    const roles = Array.from(rolesSet);
    const primaryRole = (profile?.role as UserRole) || roles[0];

    return {
      user,
      profile,
      roles,
      primaryRole,
      supabase,
    };
  } catch (err) {
    console.error("[server-auth] Error resolving user context:", err);
    return null;
  }
}

/**
 * Enforces that a request has an authenticated user matching at least one of the allowed roles.
 * Admins are granted universal access across staff endpoints.
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[]
): Promise<{ context: AuthenticatedContext; errorResponse: null } | { context: null; errorResponse: NextResponse }> {
  const context = await getAuthenticatedContext();

  if (!context) {
    return {
      context: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      ),
    };
  }

  const roleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Admin possesses universal access
  const isAuthorized =
    context.roles.includes("admin") ||
    roleArray.some((role) => context.roles.includes(role));

  if (!isAuthorized) {
    return {
      context: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden: You do not have permission to access this resource." },
        { status: 403 }
      ),
    };
  }

  return { context, errorResponse: null };
}
