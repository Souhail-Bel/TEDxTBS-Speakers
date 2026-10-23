import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/log";

function randomTempPassword() {
  // Readable-ish but strong enough for a one-time, admin-shared temp password.
  const words = ["tedx", "tbs", "speak", "track", "stage", "talk", "rise", "amp", "beam", "spark"];
  const w = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const sym = ["!", "#", "$", "%", "*"][Math.floor(Math.random() * 5)];
  return `${w[0].toUpperCase()}${w.slice(1)}${num}${sym}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can add team members." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const role = body?.role === "admin" ? "admin" : "member";
  const phone = typeof body?.phone === "string" ? body.phone.trim() || null : null;
  const facebookUrl = typeof body?.facebookUrl === "string" ? body.facebookUrl.trim() || null : null;
  const mode = body?.mode === "temp_password" ? "temp_password" : "invite";

  if (!email || !fullName) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const origin = new URL(request.url).origin;

  let newUserId: string | null = null;
  let tempPassword: string | null = null;

  if (mode === "invite") {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role },
      redirectTo: `${origin}/reset-password?welcome=1`,
    });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Couldn't send the invite. Check the email address." },
        { status: 400 }
      );
    }
    newUserId = data.user?.id ?? null;
  } else {
    tempPassword = randomTempPassword();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Couldn't create the account." },
        { status: 400 }
      );
    }
    newUserId = data.user?.id ?? null;
  }

  if (!newUserId) {
    return NextResponse.json({ error: "Account was created but no ID was returned." }, { status: 500 });
  }

  // The on_auth_user_created trigger already created the profiles row from
  // user_metadata; fill in the extra fields it doesn't know about.
  if (phone || facebookUrl) {
    await admin.from("profiles").update({ phone, facebook_url: facebookUrl }).eq("id", newUserId);
  }

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: "team_member.invited",
    entityType: "profile",
    entityId: newUserId,
    metadata: { email, full_name: fullName, role, mode },
  });

  return NextResponse.json({ success: true, tempPassword });
}
