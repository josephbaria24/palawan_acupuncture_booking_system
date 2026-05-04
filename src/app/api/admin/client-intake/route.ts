import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "@/lib/encryption";
import type { IntakeFormType } from "@/types/patient-intake";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function parsePayload(cipher: string): unknown {
  const raw = decrypt(cipher);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: "acupuncture_system" },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await patientSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const clientKey = req.nextUrl.searchParams.get("clientKey");
    if (!clientKey) {
      return NextResponse.json({ error: "clientKey is required" }, { status: 400 });
    }

    const { data: rows, error } = await patientSupabase
      .from("patient_intake_forms")
      .select("form_type, payload_cipher")
      .eq("client_key", clientKey);

    if (error) throw error;

    const result: { new_patient: unknown | null; follow_up: unknown | null } = {
      new_patient: null,
      follow_up: null,
    };

    for (const row of rows || []) {
      const ft = row.form_type as IntakeFormType;
      if (ft !== "new_patient" && ft !== "follow_up") continue;
      result[ft] = parsePayload(row.payload_cipher as string);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("client-intake GET failed:", error);
    return NextResponse.json({ error: error.message || "Failed to load intake forms." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 });
    }

    const patientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: "acupuncture_system" },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await patientSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json();
    const clientKey = body.clientKey as string | undefined;
    const formType = body.formType as IntakeFormType | undefined;
    const payload = body.payload;

    if (!clientKey || !formType || (formType !== "new_patient" && formType !== "follow_up")) {
      return NextResponse.json({ error: "clientKey and valid formType are required" }, { status: 400 });
    }

    const cipher = encrypt(JSON.stringify(payload ?? {}));

    const { error } = await patientSupabase.from("patient_intake_forms").upsert(
      {
        client_key: clientKey,
        form_type: formType,
        payload_cipher: cipher,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_key,form_type" },
    );

    if (error) throw error;

    try {
      await patientSupabase.from("audit_logs").insert([
        {
          actor_id: user.id,
          actor_email: user.email,
          action: "CLIENT_INTAKE_SAVE",
          resource_id: clientKey,
          resource_type: "patient_intake",
          metadata: { formType },
        },
      ]);
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("client-intake POST failed:", error);
    return NextResponse.json({ error: error.message || "Failed to save intake form." }, { status: 500 });
  }
}
