import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authContext = await getAuthenticatedContext();
  if (!authContext) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const { user, profile, roles, primaryRole } = authContext;
  const isAdmin =
    roles.includes("admin") ||
    primaryRole === "admin" ||
    profile?.role === "admin" ||
    user?.email === "aimssalipur@gmail.com" ||
    user?.email === "sahilsahoo68@gmail.com";

  const isInstructor = roles.includes("instructor") || primaryRole === "instructor";

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    roles,
    primaryRole,
    isAdmin,
    isInstructor,
  });
}

