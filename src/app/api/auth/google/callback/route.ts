import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    console.log("Exchanging code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received:", tokens.refresh_token ? "Refresh token present" : "No refresh token!");
    
    if (supabaseAdmin && tokens.refresh_token) {
      console.log("Upserting to Supabase...");
      const { error } = await supabaseAdmin
        .from('calendar_sync_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          google_refresh_token: tokens.refresh_token,
          is_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("SUPABASE DB ERROR:", error);
        return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
      }
      console.log("Sync settings saved successfully!");
    } else {
      console.error("FAILED: supabaseAdmin is", !!supabaseAdmin, "Refresh token is", !!tokens.refresh_token);
    }

    // Redirect back to admin dashboard with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/schedules?sync=success`);
  } catch (error: any) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
