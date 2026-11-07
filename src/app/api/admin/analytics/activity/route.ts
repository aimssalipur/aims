import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireRole(["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const supabaseAdmin = createAdminClient();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Fetch profiles activity metrics
    const { data: profiles, error: pError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, last_seen_at, time_spent_today_seconds, time_spent_month_seconds, total_time_spent_seconds");

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    const allProfiles = profiles || [];

    // Filter currently online (last 5 minutes)
    const onlineUsers = allProfiles.filter(
      (p) => p.last_seen_at && new Date(p.last_seen_at).getTime() >= new Date(fiveMinutesAgo).getTime()
    );

    // DAU: active today
    const dauUsers = allProfiles.filter(
      (p) =>
        (p.time_spent_today_seconds || 0) > 0 ||
        (p.last_seen_at && (p.total_time_spent_seconds || 0) > 0 && new Date(p.last_seen_at).getTime() >= new Date(startOfToday).getTime())
    );

    // MAU: active this month
    const mauUsers = allProfiles.filter(
      (p) =>
        (p.time_spent_month_seconds || 0) > 0 ||
        (p.last_seen_at && (p.total_time_spent_seconds || 0) > 0 && new Date(p.last_seen_at).getTime() >= new Date(startOfMonth).getTime())
    );

    // Time spent aggregations
    const totalTodaySeconds = dauUsers.reduce((sum, p) => sum + (p.time_spent_today_seconds || 0), 0);
    const avgTodayMinutes = dauUsers.length > 0 ? Math.round(totalTodaySeconds / dauUsers.length / 60) : 0;

    const totalMonthSeconds = allProfiles.reduce((sum, p) => sum + (p.time_spent_month_seconds || 0), 0);
    const totalMonthHours = Math.round((totalMonthSeconds / 3600) * 10) / 10;

    // 2. Fetch past 7 days trend from user_daily_activity
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: dailyActivity } = await supabaseAdmin
      .from("user_daily_activity")
      .select("activity_date, seconds_spent, user_id")
      .gte("activity_date", sevenDaysAgo);

    // Group by date
    const trendMap: Record<string, { activeUsers: Set<string>; totalSeconds: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      trendMap[d] = { activeUsers: new Set(), totalSeconds: 0 };
    }

    (dailyActivity || []).forEach((row) => {
      const d = row.activity_date;
      if (trendMap[d]) {
        trendMap[d].activeUsers.add(row.user_id);
        trendMap[d].totalSeconds += row.seconds_spent || 0;
      }
    });

    const dailyTrend = Object.entries(trendMap).map(([date, val]) => ({
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      activeCount: val.activeUsers.size,
      totalHours: Math.round((val.totalSeconds / 3600) * 10) / 10,
    }));

    return NextResponse.json({
      currentlyOnline: onlineUsers.length,
      dau: dauUsers.length,
      mau: mauUsers.length,
      totalUsers: allProfiles.length,
      avgTodayMinutes,
      totalMonthHours,
      dailyTrend,
      onlineUsers: onlineUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        role: u.role,
        last_seen_at: u.last_seen_at,
        time_spent_today_seconds: u.time_spent_today_seconds,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to compute activity analytics" }, { status: 500 });
  }
}
