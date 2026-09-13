import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import type { UserRole } from "@/lib/types";

import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role: UserRole = "student";
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile: any = null;
  let roles: UserRole[] = [];
  const { data } = await supabase
    .from("profiles")
    .select("*, user_roles(role)")
    .eq("id", user.id)
    .single();

  if (data) {
    profile = data;
    roles = data.user_roles?.map((ur: any) => ur.role as UserRole) || [];
    if (data.role && !roles.includes(data.role as UserRole)) {
      roles.push(data.role as UserRole);
    }
  }

  // Check student approval
  if (profile && !profile.approved && profile.role === "student") {
    redirect("/login?error=pending_approval");
  }

  const currentUser = {
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "Riya Sahu",
    email: user?.email || "riya.sahu@aims.edu",
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    roles: roles,
  };

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      <DashboardSidebar role={role} user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardTopbar role={role} userName={currentUser.full_name} />
        <main className="flex-1 pt-16 lg:pt-0 px-4 sm:px-6 xl:px-8 py-6 lg:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
