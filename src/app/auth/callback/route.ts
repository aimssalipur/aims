/**
 * Supabase Auth Callback Route Handler
 * Exchanges authorization code for session and handles role-based redirection on Vercel
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role") || "student"; // Default to student
  const next = requestUrl.searchParams.get("next") || `/${role}`;

  // Robust origin resolution for Vercel deployment
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  let origin = requestUrl.origin;
  if (!isLocalEnv && forwardedHost) {
    origin = `https://${forwardedHost}`;
  } else if (!isLocalEnv && process.env.NEXT_PUBLIC_SITE_URL) {
    origin = process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fetch authenticated user info
      const { data: { user } } = await supabase.auth.getUser();
      let redirectUrl = `${origin}${next}`;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, approved, is_active")
          .eq("id", user.id)
          .single();

        // Evict deactivated accounts immediately
        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=account_inactive`);
        }

        const isUniversalAdmin =
          user.email === "sahilsahoo68@gmail.com" ||
          user.email === "aimssalipur@gmail.com" ||
          profile?.role === "admin";

        if (isUniversalAdmin) {
          // Ensure admin role assigned in user_roles and profiles
          const { data: currentRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          const rolesList = currentRoles?.map((ur: any) => ur.role) || [];

          if (!rolesList.includes("admin")) {
            await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
          }

          if (profile?.role !== "admin") {
            await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
          }

          redirectUrl = `${origin}/admin`;
        } else if (profile?.role) {
          // Strictly route to their canonical profile role (e.g. /instructor, /accountant, /student)
          redirectUrl = `${origin}/${profile.role}`;
        }
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user`
  );
}
