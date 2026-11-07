import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let seconds = 60;
    try {
      const body = await request.json();
      if (body && typeof body.seconds === "number" && body.seconds > 0 && body.seconds <= 120) {
        seconds = Math.round(body.seconds);
      }
    } catch {
      // noop - default 60 seconds
    }

    const supabaseAdmin = createAdminClient();
    const { error: rpcError } = await supabaseAdmin.rpc("record_user_heartbeat", {
      p_user_id: user.id,
      p_seconds: seconds,
    });

    if (rpcError) {
      console.error("[heartbeat] RPC error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record heartbeat" }, { status: 500 });
  }
}

