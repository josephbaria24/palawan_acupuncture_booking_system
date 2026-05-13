import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { createClient } from "@supabase/supabase-js";
import type { ClientDirectoryPatient } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAuthClient(authHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "acupuncture_system" },
    global: { headers: { Authorization: authHeader } },
  });
}

function friendlyDirectoryError(raw: string): string | null {
  const m = raw.toLowerCase();
  if (
    m.includes("client_directory") &&
    (m.includes("does not exist") || m.includes("could not find") || m.includes("schema cache"))
  ) {
    return (
      "The client_directory table is missing. Open the Supabase SQL Editor and run the migration in " +
      "supabase/migrations/20260513120000_client_directory.sql (creates acupuncture_system.client_directory + RLS)."
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = getAuthClient(authHeader);
    const { data: { user }, error: authError } = await patientSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows, error } = await patientSupabase
      .from("client_directory")
      .select("id, created_at, client_name, phone, email, notes")
      .order("created_at", { ascending: false });

    if (error) {
      const hint = friendlyDirectoryError(error.message || "");
      throw new Error(hint || error.message || "Query failed");
    }

    const decrypted: ClientDirectoryPatient[] = (rows || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      client_name: decrypt(String(row.client_name ?? "")),
      phone: decrypt(String(row.phone ?? "")),
      email: decrypt(String(row.email ?? "")),
      notes: decrypt(String(row.notes ?? "")),
    }));

    return NextResponse.json(decrypted);
  } catch (error: any) {
    console.error("client-directory GET failed:", error);
    const msg = error?.message || "Failed to load directory patients.";
    const status = msg.includes("client_directory table is missing") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = getAuthClient(authHeader);
    const { data: { user }, error: authError } = await patientSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const patients = body.patients as Array<{ name: string; phone: string; email?: string; notes?: string }> | undefined;
    if (!Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json({ error: "patients array is required" }, { status: 400 });
    }
    if (patients.length > 500) {
      return NextResponse.json({ error: "Maximum 500 rows per import" }, { status: 400 });
    }

    const rows = patients.map((p) => {
      const name = (p.name || "").trim();
      const phone = (p.phone || "").trim();
      const email = (p.email || "").trim() || "No Email";
      const notes = (p.notes || "").trim();
      if (!name || !phone) {
        throw new Error("Each row needs at least name and phone");
      }
      return {
        client_name: encrypt(name),
        phone: encrypt(phone),
        email: encrypt(email),
        notes: encrypt(notes),
      };
    });

    const { data: inserted, error } = await patientSupabase.from("client_directory").insert(rows).select("id");

    if (error) {
      const hint = friendlyDirectoryError(error.message || JSON.stringify(error));
      throw new Error(hint || error.message || "Insert failed");
    }

    try {
      await patientSupabase.from("audit_logs").insert([
        {
          actor_id: user.id,
          actor_email: user.email,
          action: "IMPORT_CLIENT_DIRECTORY",
          resource_id: "bulk",
          resource_type: "client_directory",
          metadata: { count: inserted?.length ?? rows.length },
        },
      ]);
    } catch (auditErr) {
      console.error("audit log failed:", auditErr);
    }

    return NextResponse.json({ ok: true, inserted: inserted?.length ?? rows.length });
  } catch (error: any) {
    console.error("client-directory POST failed:", error);
    const msg = error?.message || "Import failed.";
    const status = msg.includes("client_directory table is missing") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = getAuthClient(authHeader);
    const { data: { user }, error: authError } = await patientSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const ids = body.ids as string[] | undefined;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }
    if (ids.length > 500) {
      return NextResponse.json({ error: "Maximum 500 rows per delete request" }, { status: 400 });
    }

    const uniqueIds = Array.from(new Set(ids.map((v) => String(v || "").trim()).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: "No valid ids provided" }, { status: 400 });
    }

    const { error, count } = await patientSupabase
      .from("client_directory")
      .delete({ count: "exact" })
      .in("id", uniqueIds);

    if (error) {
      const hint = friendlyDirectoryError(error.message || JSON.stringify(error));
      throw new Error(hint || error.message || "Delete failed");
    }

    try {
      await patientSupabase.from("audit_logs").insert([
        {
          actor_id: user.id,
          actor_email: user.email,
          action: "DELETE_CLIENT_DIRECTORY",
          resource_id: "bulk",
          resource_type: "client_directory",
          metadata: { count: count ?? uniqueIds.length, ids: uniqueIds },
        },
      ]);
    } catch (auditErr) {
      console.error("audit log failed:", auditErr);
    }

    return NextResponse.json({ ok: true, deleted: count ?? uniqueIds.length });
  } catch (error: any) {
    console.error("client-directory DELETE failed:", error);
    const msg = error?.message || "Delete failed.";
    const status = msg.includes("client_directory table is missing") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
