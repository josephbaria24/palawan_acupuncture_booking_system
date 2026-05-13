import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/encryption";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authorization by checking the session token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    // Create a specific client using the user's JWT to satisfy RLS while accessing custom schema
    const patientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: "acupuncture_system" },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await patientSupabase.auth.getUser();

    if (authError || !user) {
      console.error("Unauthorized admin access attempt:", authError);
      return NextResponse.json({ error: "Unauthorized access. Session might have expired." }, { status: 401 });
    }

    // 2. Fetch bookings using the authenticated client
    const scheduleId = req.nextUrl.searchParams.get("scheduleId");

    // --- Audit Log ---
    try {
      await patientSupabase.from('audit_logs').insert([{
        actor_id: user.id,
        actor_email: user.email,
        action: 'VIEW_PATIENT_LIST',
        resource_id: scheduleId || 'all',
        resource_type: 'bookings',
        metadata: { scheduleId, access_type: 'decryption_api' }
      }]);
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    let query = patientSupabase
      .from('bookings')
      .select(`
        *,
        schedules (*)
      `)
      .order('created_at', { ascending: false });

    if (scheduleId) {
      query = query.eq('schedule_id', scheduleId);
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    // 3. Decrypt sensitive fields for each booking (empty string if key mismatch / corrupt)
    const decryptedBookings = bookings.map((booking) => ({
      ...booking,
      client_name: decrypt(String(booking.client_name ?? "")),
      phone: decrypt(String(booking.phone ?? "")),
      email: decrypt(String(booking.email ?? "")),
      notes: decrypt(String(booking.notes ?? "")),
    }));

    return NextResponse.json(decryptedBookings);
  } catch (error: any) {
    console.error("Admin bookings fetch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admin data." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: "acupuncture_system" },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await patientSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access. Session might have expired." }, { status: 401 });
    }

    const body = await req.json();
    const ids = body.ids as string[] | undefined;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }
    if (ids.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 booking ids per request" }, { status: 400 });
    }
    const uniqueIds = Array.from(new Set(ids.map((v) => String(v || "").trim()).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: "No valid ids provided" }, { status: 400 });
    }

    const { error, count } = await patientSupabase
      .from("bookings")
      .delete({ count: "exact" })
      .in("id", uniqueIds);

    if (error) throw error;

    try {
      await patientSupabase.from("audit_logs").insert([{
        actor_id: user.id,
        actor_email: user.email,
        action: "DELETE_BOOKINGS_BULK",
        resource_id: "bulk",
        resource_type: "bookings",
        metadata: { count: count ?? uniqueIds.length, ids: uniqueIds },
      }]);
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    return NextResponse.json({ ok: true, deleted: count ?? uniqueIds.length });
  } catch (error: any) {
    console.error("Admin bookings delete failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bookings." }, { status: 500 });
  }
}
