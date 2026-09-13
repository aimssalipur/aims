import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If Supabase redirects to any route with ?code=... (e.g. /?code=...), forward directly to /auth/callback
  if (request.nextUrl.searchParams.has("code") && !path.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if close to expiry and enforce role-based access control.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    /* noop */
  }

  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isStudentPath = path.startsWith("/student");
  const isInstructorPath = path.startsWith("/instructor");
  const isAccountantPath = path.startsWith("/accountant");

  if (isAdminPath || isStudentPath || isInstructorPath || isAccountantPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Retrieve user's assigned roles and primary role from database
    let roles: string[] = [];
    let primaryRole = "student";
    try {
      // 1. Check profiles table for canonical role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        primaryRole = profile.role;
        roles.push(profile.role);
      }

      // 2. Check user_roles table for secondary assigned roles
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (userRoles && userRoles.length > 0) {
        for (const ur of userRoles) {
          if (ur.role && !roles.includes(ur.role)) {
            roles.push(ur.role);
          }
        }
      }

      // Default fallback if no role records exist
      if (roles.length === 0) {
        roles.push("student");
      }

      // Check student approval
      if (profile && !profile.approved && primaryRole === "student") {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "pending_approval");
        return NextResponse.redirect(url);
      }
    } catch (err) {
      if (roles.length === 0) roles.push("student");
    }

    // Role route validation: strictly forbid entering other roles
    // 1. Admin routes: only admin role allowed
    if (isAdminPath && !roles.includes("admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${primaryRole}`;
      return NextResponse.redirect(url);
    }

    // 2. Instructor routes: instructor or admin allowed
    if (isInstructorPath && !roles.includes("instructor") && !roles.includes("admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${primaryRole}`;
      return NextResponse.redirect(url);
    }

    // 3. Accountant routes: accountant or admin allowed
    if (isAccountantPath && !roles.includes("accountant") && !roles.includes("admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${primaryRole}`;
      return NextResponse.redirect(url);
    }

    // 4. Student routes: student or admin allowed
    if (isStudentPath && !roles.includes("student") && !roles.includes("admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${primaryRole}`;
      return NextResponse.redirect(url);
    }
  }

  // Redirect already authenticated users trying to hit login/signup
  if ((path.startsWith("/login") || path.startsWith("/signup")) && user) {
    let targetRole = "student";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        targetRole = profile.role;
      }
    } catch (err) {
      /* noop */
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${targetRole}`;
    return NextResponse.redirect(url);
  }

  return response;
}
