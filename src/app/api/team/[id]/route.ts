import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/log";

async function getCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    userId: user.id,
    isAdmin: callerProfile?.role === "admin",
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getCaller();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : undefined;
  const phone = typeof body?.phone === "string" ? body.phone.trim() || null : undefined;
  const facebookUrl = typeof body?.facebookUrl === "string" ? body.facebookUrl.trim() || null : undefined;
  const avatarUrl =
    body?.avatarUrl === null
      ? null
      : typeof body?.avatarUrl === "string"
        ? body.avatarUrl.trim() || null
        : undefined;
  const bio =
    body?.bio === null
      ? null
      : typeof body?.bio === "string"
        ? body.bio.trim() || null
        : undefined;
  const contactedCount =
    body?.contactedCount === null || body?.contactedCount === ""
      ? null
      : typeof body?.contactedCount === "number" && Number.isFinite(body.contactedCount)
        ? Math.max(0, Math.floor(body.contactedCount))
        : undefined;
  const role = body?.role === "admin" || body?.role === "member" ? body.role : undefined;

  if (role !== undefined && !auth.isAdmin) {
    return NextResponse.json({ error: "Only an admin can change privilege levels." }, { status: 403 });
  }

  const update: Record<string, unknown> = {};
  if (fullName !== undefined) update.full_name = fullName;
  if (phone !== undefined) update.phone = phone;
  if (facebookUrl !== undefined) update.facebook_url = facebookUrl;
  if (avatarUrl !== undefined) update.avatar_url = avatarUrl;
  if (bio !== undefined) update.bio = bio;
  if (contactedCount !== undefined) update.contacted_count = contactedCount;
  if (role !== undefined) update.role = role;

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message || "Couldn't update that team member." }, { status: 400 });
  }

  await writeAuditLog(auth.supabase, {
    actorId: auth.userId,
    action: role !== undefined ? "team_member.role_changed" : "team_member.updated",
    entityType: "profile",
    entityId: id,
    metadata: update,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getCaller();
  if ("error" in auth) return auth.error;
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Only an admin can remove team members." }, { status: 403 });
  }
  const { id } = await params;

  if (id === auth.userId) {
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message || "Couldn't remove that team member." }, { status: 400 });
  }

  await writeAuditLog(auth.supabase, {
    actorId: auth.userId,
    action: "team_member.removed",
    entityType: "profile",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
