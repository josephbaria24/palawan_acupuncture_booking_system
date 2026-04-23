import { google } from 'googleapis';
import { supabaseAdmin } from './supabase';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

/**
 * Gets a fresh authorized calendar client using the stored refresh token.
 */
async function getCalendarClient() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const { data: settings, error } = await supabaseAdmin
    .from('calendar_sync_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (error || !settings?.google_refresh_token) {
    console.log("Calendar sync not enabled or missing refresh token.");
    return null;
  }

  oauth2Client.setCredentials({
    refresh_token: settings.google_refresh_token
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Synchronizes a clinic schedule slot to Google Calendar.
 * If the schedule already has a google_event_id, it updates it.
 */
export async function syncScheduleToGoogle(scheduleId: string) {
  try {
    const calendar = await getCalendarClient();
    if (!calendar) return;

    // Fetch the latest schedule data with bookings
    const { data: schedule, error } = await supabaseAdmin!
      .from('schedules')
      .select('*, bookings(id, status)')
      .eq('id', scheduleId)
      .single();

    if (error || !schedule) throw new Error("Schedule not found");

    const confirmedCount = schedule.bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
    
    // Prepare the event data
    const date = new Date(schedule.date);
    const [sh, sm] = (schedule.start_time || "08:00").split(':');
    const [eh, em] = (schedule.end_time || "08:30").split(':');
    const start = new Date(date);
    start.setHours(parseInt(sh), parseInt(sm), 0, 0);
    const end = new Date(date);
    end.setHours(parseInt(eh), parseInt(em), 0, 0);

    const event = {
      summary: `Clinic: ${schedule.title} (${confirmedCount}/${schedule.capacity})`,
      description: `Status: ${schedule.status}\nOccupancy: ${confirmedCount}/${schedule.capacity}\nNotes: ${schedule.notes || 'None'}\n\nManaged by Palawan Acupuncture Booking System.`,
      location: schedule.location || "Palawan Acupuncture Clinic",
      start: {
        dateTime: start.toISOString(),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'Asia/Manila',
      },
      reminders: {
        useDefault: true,
      },
    };

    if (schedule.google_event_id) {
      // Update existing event
      await calendar.events.update({
        calendarId: 'primary',
        eventId: schedule.google_event_id,
        requestBody: event,
      });
      console.log(`Updated Google Event: ${schedule.google_event_id}`);
    } else {
      // Create new event
      const { data: createdEvent } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      if (createdEvent.id) {
        // Save the event ID back to our database
        await supabaseAdmin!
          .from('schedules')
          .update({ google_event_id: createdEvent.id })
          .eq('id', scheduleId);
        
        console.log(`Created Google Event: ${createdEvent.id}`);
      }
    }
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error);
  }
}

/**
 * Deletes an event from Google Calendar when a schedule is removed.
 */
export async function deleteFromGoogle(googleEventId: string) {
  try {
    const calendar = await getCalendarClient();
    if (!calendar || !googleEventId) return;

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
    console.log(`Deleted Google Event: ${googleEventId}`);
  } catch (error) {
    console.error("Error deleting from Google Calendar:", error);
  }
}
