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

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      // If no refresh token, it might be because the user already authorized.
      // We should ideally tell them to disconnect and reconnect, or use prompt: 'consent' in login.
      // But we added prompt: 'consent' so we should always get it.
    }

    if (supabaseAdmin && tokens.refresh_token) {
      // Upsert the sync settings (we only support one main clinic calendar for now)
      const { error } = await supabaseAdmin
        .from('calendar_sync_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001', // Static ID for the clinic's master settings
          google_refresh_token: tokens.refresh_token,
          is_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to save refresh token:", error);
        return NextResponse.json({ error: 'Failed to save sync settings' }, { status: 500 });
      }
    }

    // Redirect back to admin dashboard with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/schedules?sync=success`);
  } catch (error: any) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
