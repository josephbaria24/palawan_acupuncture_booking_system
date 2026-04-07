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

    // Decrypt and then Mask sensitive data before sending to the public client
    const decryptedName = decrypt(booking.client_name);
    
    const maskName = (name: string) => {
      if (!name) return "";
      const parts = name.split(" ");
      const mask = (str: string) => {
        if (str.length <= 2) return str[0] + "*";
        return str[0] + "***" + str[str.length - 1];
      };
      if (parts.length === 1) return mask(parts[0]);
      return `${mask(parts[0])} ${mask(parts[parts.length - 1])}`;
    };

    return NextResponse.json({
      ...booking,
      client_name: maskName(decryptedName),
      // We don't return phone or email to the public tracking page at all for privacy
      phone: "********", 
      email: "********",
      notes: booking.notes ? "Confidential" : "" 
    });
  } catch (error: any) {
    console.error("Public tracking fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch tracking details" }, { status: 500 });
  }
}
