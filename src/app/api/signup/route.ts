import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CLEAN_REGEX = /[^0-9]/g;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, course, course_ids } = body;

    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, fullName, phone" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(fullName).trim();
    const rawPassword = String(password);
    const cleanedPhone = String(phone).replace(PHONE_CLEAN_REGEX, "");

    // 1. Email format validation
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // 2. Password length & strength policy
    if (rawPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    if (rawPassword.length > 128) {
      return NextResponse.json(
        { error: "Password is too long (maximum 128 characters)." },
        { status: 400 }
      );
    }

    // 3. Phone number validation
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit WhatsApp/phone number." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create user in Supabase Auth (emails are confirmed automatically, but login will be blocked by approval check)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        password: rawPassword,
        email_confirm: true,
        user_metadata: {
          full_name: trimmedName.slice(0, 100),
          phone: cleanedPhone.slice(0, 20),
          course: String(course || "").trim().slice(0, 200),
          course_ids: String(course_ids || "").trim().slice(0, 500),
          role: "student", // Explicitly hardcoded: prevents privilege escalation
          approved: false, // Explicitly false: requires admin verification
        },
      });

    if (authError) {
      // Avoid exposing detailed internal database stack traces
      return NextResponse.json(
        { error: authError.message || "Failed to complete signup registration." },
        { status: 400 }
      );
    }

    // Wait 500ms to allow DB triggers to insert the profile and roles
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: any) {
    console.error("[api/signup] Signup error:", err?.message || err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
