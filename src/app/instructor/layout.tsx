import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import type { UserRole } from "@/lib/types";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Instructor Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role: UserRole = "instructor";
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

  const isAdmin = roles.includes("admin") || profile?.role === "admin" || user?.email === "aimssalipur@gmail.com";
  if (isAdmin) {
    roles = ["student", "instructor", "accountant", "admin"];
  }

  // Reject unauthorized users (only instructor and admin allowed)
  if (!isAdmin && !roles.includes("instructor") && profile?.role !== "instructor") {
    redirect(`/${profile?.role || "student"}`);
  }

  const currentUser = {
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Instructor",
    email: user?.email || "",
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || "",
    roles: roles,
  };

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      <DashboardSidebar role={role} user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardTopbar role={role} userName={currentUser.full_name} />
        <main className="flex-1 pt-14 lg:pt-0 px-3 sm:px-6 xl:px-8 py-3.5 sm:py-6 lg:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
