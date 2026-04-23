import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { encrypt } from "@/lib/encryption";
import { syncScheduleToGoogle } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Incoming Booking Data:", data);
    const { client_name, phone, email, notes, ...rest } = data;

    if (!supabase) {
      return NextResponse.json({ error: "Internal Server Error: Database access not configured" }, { status: 500 });
    }

    // Generate unique reference code: PA-XXXXXX
    const ref = `PA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Encrypt sensitive and identifiable data
    const encryptedData = {
      ...rest,
      reference_code: ref,
      client_name: encrypt(client_name),
      phone: encrypt(phone),
      email: encrypt(email),
      notes: encrypt(notes || ""),
    };

    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert([encryptedData])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error during booking creation:", error);
      throw error;
    }

    // Return the original (unencrypted) data back to the patient for immediate confirmation view
    // The database now strictly holds the encrypted versions.
    return NextResponse.json({
      ...newBooking,
      client_name,
      phone,
      email,
      notes
    });

    // Trigger background sync to Google Calendar (non-blocking)
    if (newBooking.schedule_id) {
      syncScheduleToGoogle(newBooking.schedule_id).catch(err => console.error("Auto-Sync failed:", err));
    }

    return response;
  } catch (error: any) {
    console.error("CRITICAL BOOKING ERROR:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to register booking securely.",
      details: error.stack
    }, { status: 500 });
  }
}
