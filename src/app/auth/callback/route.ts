import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") || "student"; // Default to student
  const next = searchParams.get("next") || `/${role}`;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fetch authenticated user info
      const { data: { user } } = await supabase.auth.getUser();
      let redirectUrl = `${origin}${next}`;

      if (user && user.email === "sahilsahoo68@gmail.com") {
        // Automatically make admin!
        
        // 1. Assign admin and student roles in user_roles table
        const { data: currentRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        
        const rolesList = currentRoles?.map((ur: any) => ur.role) || [];
        
        if (!rolesList.includes("admin")) {
          await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
        }
        
        if (!rolesList.includes("student")) {
          await supabase.from("user_roles").insert({ user_id: user.id, role: "student" });
        }

        // 2. Set active role in profiles table to admin
        await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", user.id);

        redirectUrl = `${origin}/admin`;
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user`
  );
}
