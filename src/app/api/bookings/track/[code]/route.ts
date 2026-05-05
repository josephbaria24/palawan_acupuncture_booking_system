import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!supabase) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedules (*)
      `)
      .eq('reference_code', code.toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Decrypt data before sending to the client
    const decryptedName = decrypt(booking.client_name);
    const decryptedPhone = decrypt(booking.phone);
    const decryptedEmail = decrypt(booking.email);
    const decryptedNotes = decrypt(booking.notes);

    return NextResponse.json({
      ...booking,
      client_name: decryptedName,
      phone: decryptedPhone, 
      email: decryptedEmail,
      notes: decryptedNotes
    });
  } catch (error: any) {
    console.error("Public tracking fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch tracking details" }, { status: 500 });
  }
}
